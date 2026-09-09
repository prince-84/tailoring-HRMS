<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceRegularization;
use App\Models\ComplianceDocument;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveApplication;
use App\Models\PayrollRun;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today();

        // Admin / HR Summary
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'active')->count();

        // Today's attendance
        $todayAttendances = Attendance::where('date', $today->format('Y-m-d'))->get();
        $presentToday = $todayAttendances->whereIn('status', ['present', 'late'])->count();
        $lateToday = $todayAttendances->where('status', 'late')->count();
        $onLeaveToday = $todayAttendances->where('status', 'on_leave')->count();
        $absentToday = max(0, $activeEmployees - $presentToday - $onLeaveToday);

        // Pending Approvals
        $pendingLeavesCount = LeaveApplication::where('status', 'pending')->count();
        $pendingRegularizationsCount = AttendanceRegularization::where('status', 'pending')->count();

        // Compliance Alerts (within 90 days and expired)
        $complianceAlerts = ComplianceDocument::with('employee.department')
            ->where(function ($query) {
                $query->where('expiry_date', '<=', Carbon::now()->addDays(90)->format('Y-m-d'))
                    ->orWhere('expiry_date', '<', Carbon::now()->format('Y-m-d'));
            })
            ->orderBy('expiry_date', 'asc')
            ->take(6)
            ->get()
            ->map(function ($doc) {
                $days = (int) Carbon::now()->diffInDays(Carbon::parse($doc->expiry_date), false);
                return [
                    'id' => $doc->id,
                    'employee_name' => $doc->employee->full_name,
                    'department' => $doc->employee->department?->name,
                    'document_type' => $doc->document_type,
                    'document_number' => $doc->document_number,
                    'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                    'days_remaining' => $days,
                    'status' => $days < 0 ? 'expired' : ($days <= 30 ? 'critical' : ($days <= 60 ? 'warning' : 'expiring_soon')),
                ];
            });

        // Department breakdown
        $departmentDistribution = Department::withCount('employees')
            ->where('status', 'active')
            ->get()
            ->map(function ($dept) {
                return [
                    'name' => $dept->name,
                    'code' => $dept->code,
                    'count' => $dept->employees_count,
                ];
            });

        // Payroll summary for previous month
        $latestPayroll = PayrollRun::orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();

        $payrollSummary = [
            'batch_name' => $latestPayroll ? $latestPayroll->batch_name : 'No recent payroll',
            'total_net_aed' => $latestPayroll ? (float) $latestPayroll->total_net : 0.00,
            'total_gross_aed' => $latestPayroll ? (float) $latestPayroll->total_gross : 0.00,
            'status' => $latestPayroll ? ucfirst($latestPayroll->status) : 'N/A',
            'processed_count' => $latestPayroll ? $latestPayroll->total_employees : 0,
            'wps_exported' => $latestPayroll ? $latestPayroll->wps_sif_exported : false,
        ];

        // Weekly attendance trend (Last 7 days)
        $weeklyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayAttendances = Attendance::where('date', $date->format('Y-m-d'))->get();
            $weeklyTrend[] = [
                'day' => $date->format('D, M d'),
                'present' => $dayAttendances->whereIn('status', ['present', 'late'])->count(),
                'late' => $dayAttendances->where('status', 'late')->count(),
                'on_leave' => $dayAttendances->where('status', 'on_leave')->count(),
            ];
        }

        // Upcoming anniversaries and celebrations
        $celebrations = Employee::take(4)->get()->map(function ($emp) {
            return [
                'name' => $emp->full_name,
                'designation' => $emp->designation?->title,
                'event_type' => 'Work Anniversary',
                'date' => $emp->joining_date?->format('M d'),
                'years' => Carbon::now()->diffInYears($emp->joining_date) . ' Years',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_employees' => $totalEmployees,
                    'active_employees' => $activeEmployees,
                    'present_today' => $presentToday,
                    'late_today' => $lateToday,
                    'on_leave_today' => $onLeaveToday,
                    'absent_today' => $absentToday,
                    'pending_leave_approvals' => $pendingLeavesCount,
                    'pending_attendance_regularizations' => $pendingRegularizationsCount,
                ],
                'compliance_alerts' => $complianceAlerts,
                'department_distribution' => $departmentDistribution,
                'payroll_summary' => $payrollSummary,
                'weekly_trend' => $weeklyTrend,
                'celebrations' => $celebrations,
            ],
        ]);
    }
}
