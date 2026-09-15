<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Models\SalaryStructure;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with(['department', 'designation', 'branch', 'shift', 'manager', 'company', 'location']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('emirates_id_number', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('first_name')->paginate($request->get('per_page', 25));

        return response()->json([
            'status' => 'success',
            'data' => $employees,
        ]);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load([
            'department',
            'designation',
            'branch',
            'shift',
            'company',
            'location',
            'manager',
            'complianceDocuments',
            'leaveBalances.leaveType',
            'salaryStructure',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $employee,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'home_phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:500',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'required|string|max:100',
            'marital_status' => 'nullable|string|max:50',
            'emirates_id_number' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:50',
            'passport_issue_date' => 'nullable|date',
            'labour_card_id' => 'nullable|string|max:100',
            'visa_type' => 'nullable|string|max:50',
            'visa_expiry_date' => 'nullable|date',
            'father_name' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'blood_group' => 'nullable|string|max:10',
            'emergency_contact_person' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:30',
            'emergency_contact_email' => 'nullable|email|max:255',
            'company_visa_mol_id' => 'nullable|string|max:100',
            'company_id' => 'required|exists:companies,id',
            'location_id' => 'required|exists:locations,id',
            'employment_type' => 'nullable|string|max:50',
            'salary_transfer_method' => 'nullable|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
            'branch_id' => 'required|exists:branches,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'joining_date' => 'required|date',
            'contract_type' => 'required|in:Limited,Unlimited',
            'basic_salary' => 'required|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'transport_allowance' => 'nullable|numeric|min:0',
            'other_allowances' => 'nullable|numeric|min:0',
            'bank_name' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($validated) {
            // Generate employee code
            $count = Employee::withTrashed()->count() + 1;
            $code = 'UAE-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            // Create User account for employee
            $user = User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make('password123'),
                'phone' => $validated['phone'] ?? null,
                'branch_id' => $validated['branch_id'],
                'role_id' => 4, // Employee role default
                'status' => 'active',
                'is_active' => true,
            ]);

            $validated['user_id'] = $user->id;
            $validated['employee_code'] = $code;
            $validated['housing_allowance'] = $validated['housing_allowance'] ?? 0;
            $validated['transport_allowance'] = $validated['transport_allowance'] ?? 0;
            $validated['other_allowances'] = $validated['other_allowances'] ?? 0;

            $employee = Employee::create($validated);

            // Create Salary Structure
            SalaryStructure::create([
                'employee_id' => $employee->id,
                'basic_salary' => $employee->basic_salary,
                'housing_allowance' => $employee->housing_allowance,
                'transport_allowance' => $employee->transport_allowance,
                'other_allowances' => $employee->other_allowances,
                'gross_salary' => $employee->total_gross_salary,
                'bank_name' => $employee->bank_name,
                'iban' => $employee->iban,
                'effective_date' => $employee->joining_date,
            ]);

            // Initialize leave balances
            $leaveTypes = LeaveType::where('status', 'active')->get();
            foreach ($leaveTypes as $type) {
                LeaveBalance::create([
                    'employee_id' => $employee->id,
                    'leave_type_id' => $type->id,
                    'year' => date('Y'),
                    'total_allocated' => $type->days_per_year,
                    'used_days' => 0,
                    'pending_days' => 0,
                    'remaining_days' => $type->days_per_year,
                    'carry_forward' => 0,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Employee created successfully with generated login credentials.',
                'data' => $employee->load(['department', 'designation', 'branch', 'shift', 'company', 'location']),
            ], 201);
        });
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email,' . $employee->id,
            'phone' => 'nullable|string|max:30',
            'home_phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:500',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'required|string|max:100',
            'marital_status' => 'nullable|string|max:50',
            'emirates_id_number' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:50',
            'passport_issue_date' => 'nullable|date',
            'labour_card_id' => 'nullable|string|max:100',
            'visa_type' => 'nullable|string|max:50',
            'visa_expiry_date' => 'nullable|date',
            'father_name' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'blood_group' => 'nullable|string|max:10',
            'emergency_contact_person' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:30',
            'emergency_contact_email' => 'nullable|email|max:255',
            'company_visa_mol_id' => 'nullable|string|max:100',
            'company_id' => 'nullable|exists:companies,id',
            'location_id' => 'nullable|exists:locations,id',
            'employment_type' => 'nullable|string|max:50',
            'salary_transfer_method' => 'nullable|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'designation_id' => 'required|exists:designations,id',
            'branch_id' => 'required|exists:branches,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'joining_date' => 'required|date',
            'contract_type' => 'required|in:Limited,Unlimited',
            'basic_salary' => 'required|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'transport_allowance' => 'nullable|numeric|min:0',
            'other_allowances' => 'nullable|numeric|min:0',
            'bank_name' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:50',
            'status' => 'required|string',
        ]);

        $employee->update($validated);

        if ($employee->user) {
            $employee->user->update([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Employee details updated successfully',
            'data' => $employee->load(['department', 'designation', 'branch', 'shift', 'company', 'location']),
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Employee archived successfully',
        ]);
    }
}





