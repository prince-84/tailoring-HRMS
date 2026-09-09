<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\GratuityRecord;
use App\Models\PayrollRun;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function summary(): JsonResponse
    {
        $runs = PayrollRun::with('approver')->orderBy('year', 'desc')->orderBy('month', 'desc')->get();
        $totalCostYTD = PayrollRun::where('year', date('Y'))->sum('total_net');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_cost_ytd_aed' => (float) $totalCostYTD,
                'recent_runs' => $runs,
            ],
        ]);
    }

    public function runs(): JsonResponse
    {
        $runs = PayrollRun::with('approver')->orderBy('year', 'desc')->orderBy('month', 'desc')->paginate(12);

        return response()->json([
            'status' => 'success',
            'data' => $runs,
        ]);
    }

    public function runDetails(PayrollRun $payrollRun): JsonResponse
    {
        $payrollRun->load(['payslips.employee.department', 'payslips.employee.designation', 'approver']);

        return response()->json([
            'status' => 'success',
            'data' => $payrollRun,
        ]);
    }

    public function payslips(Request $request): JsonResponse
    {
        $query = Payslip::with(['employee.department', 'employee.designation', 'payrollRun']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $payslips = $query->orderBy('year', 'desc')->orderBy('month', 'desc')->paginate(25);

        return response()->json([
            'status' => 'success',
            'data' => $payslips,
        ]);
    }

    public function myPayslips(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'Employee profile not found.'], 404);
        }

        $payslips = Payslip::where('employee_id', $employee->id)
            ->with('payrollRun')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $payslips,
        ]);
    }

    public function generateRun(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
        ]);

        $month = $validated['month'];
        $year = $validated['year'];

        $existing = PayrollRun::where('month', $month)->where('year', $year)->first();
        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => "Payroll run for month {$month}/{$year} already exists with status '{$existing->status}'.",
            ], 422);
        }

        return DB::transaction(function () use ($month, $year, $request) {
            $periodStart = Carbon::create($year, $month, 1)->startOfMonth();
            $periodEnd = $periodStart->copy()->endOfMonth();
            $employees = Employee::where('status', 'active')->get();

            $totalGross = 0;
            $totalAllowances = 0;
            $totalDeductions = 0;
            $totalNet = 0;

            $run = PayrollRun::create([
                'batch_name' => 'Payroll Run — ' . $periodStart->format('F Y'),
                'month' => $month,
                'year' => $year,
                'pay_period_start' => $periodStart->format('Y-m-d'),
                'pay_period_end' => $periodEnd->format('Y-m-d'),
                'total_employees' => $employees->count(),
                'total_gross' => 0,
                'total_allowances' => 0,
                'total_deductions' => 0,
                'total_net' => 0,
                'status' => 'draft',
                'wps_sif_exported' => false,
            ]);

            foreach ($employees as $e) {
                $basic = $e->basic_salary;
                $housing = $e->housing_allowance;
                $transport = $e->transport_allowance;
                $other = $e->other_allowances;
                $allowances = $housing + $transport + $other;
                $gross = $basic + $allowances;
                $deductions = 0.00;
                $net = $gross - $deductions;

                $totalGross += $gross;
                $totalAllowances += $allowances;
                $totalDeductions += $deductions;
                $totalNet += $net;

                Payslip::create([
                    'payroll_run_id' => $run->id,
                    'employee_id' => $e->id,
                    'payslip_number' => 'PS-' . $year . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . $e->employee_code,
                    'month' => $month,
                    'year' => $year,
                    'basic_salary' => $basic,
                    'housing_allowance' => $housing,
                    'transport_allowance' => $transport,
                    'other_allowances' => $other,
                    'gross_salary' => $gross,
                    'overtime_hours' => 0,
                    'overtime_amount' => 0,
                    'deductions_amount' => $deductions,
                    'deductions_breakdown' => [],
                    'net_salary' => $net,
                    'payment_status' => 'Pending',
                    'generated_at' => Carbon::now(),
                ]);
            }

            $run->update([
                'total_gross' => $totalGross,
                'total_allowances' => $totalAllowances,
                'total_deductions' => $totalDeductions,
                'total_net' => $totalNet,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payroll run draft created successfully for ' . $employees->count() . ' employees.',
                'data' => $run->load('payslips.employee'),
            ], 201);
        });
    }

    public function calculateGratuity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'end_date' => 'required|date',
            'contract_type' => 'required|in:Limited,Unlimited',
            'termination_type' => 'required|in:resignation,termination,end_of_contract',
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);
        $startDate = Carbon::parse($employee->joining_date);
        $endDate = Carbon::parse($validated['end_date']);

        $totalDays = $startDate->diffInDays($endDate);
        $serviceYears = round($totalDays / 365.25, 2);

        if ($serviceYears < 1) {
            return response()->json([
                'status' => 'success',
                'message' => 'No gratuity entitled for service duration under 1 full year.',
                'data' => [
                    'employee' => $employee->full_name,
                    'service_years' => $serviceYears,
                    'basic_salary' => $employee->basic_salary,
                    'gratuity_amount_aed' => 0.00,
                    'calculation_formula' => 'UAE Labour Law: < 1 year of continuous service yields 0 entitlement.',
                ],
            ]);
        }

        $basicSalary = (float) $employee->basic_salary;
        $dailyBasic = $basicSalary / 30; // Standard 30 days per month
        $gratuity = 0;

        // UAE Labour Law Federal Decree Law No. 33 of 2021 (EOSB Standard):
        // 21 days basic salary for each year of service for first 5 years
        // 30 days basic salary for each additional year beyond 5 years
        // Total gratuity cannot exceed 2 years' full basic salary
        if ($serviceYears <= 5) {
            $gratuity = $serviceYears * (21 * $dailyBasic);
        } else {
            $first5YearsGratuity = 5 * (21 * $dailyBasic);
            $remainingYears = $serviceYears - 5;
            $remainingGratuity = $remainingYears * (30 * $dailyBasic);
            $gratuity = $first5YearsGratuity + $remainingGratuity;
        }

        $maxCap = 2 * ($basicSalary * 12);
        if ($gratuity > $maxCap) {
            $gratuity = $maxCap;
        }

        $gratuity = round($gratuity, 2);

        return response()->json([
            'status' => 'success',
            'data' => [
                'employee' => $employee->full_name,
                'joining_date' => $employee->joining_date->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'service_years' => $serviceYears,
                'basic_salary_aed' => $basicSalary,
                'daily_basic_rate_aed' => round($dailyBasic, 2),
                'gratuity_amount_aed' => $gratuity,
                'law_reference' => 'UAE Federal Decree-Law No. 33 of 2021 (Article 51 End of Service Benefits)',
                'capped_at_two_years' => $gratuity >= $maxCap,
            ],
        ]);
    }
}
