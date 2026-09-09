<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\PublicHoliday;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function types(): JsonResponse
    {
        $types = LeaveType::where('status', 'active')->get();

        return response()->json([
            'status' => 'success',
            'data' => $types,
        ]);
    }

    public function balances(Request $request): JsonResponse
    {
        $employeeId = $request->get('employee_id');

        if (!$employeeId && $request->user()->employee) {
            $employeeId = $request->user()->employee->id;
        }

        $balances = LeaveBalance::with('leaveType')
            ->where('employee_id', $employeeId)
            ->where('year', date('Y'))
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $balances,
        ]);
    }

    public function applications(Request $request): JsonResponse
    {
        $query = LeaveApplication::with(['employee.department', 'leaveType', 'approver']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $applications,
        ]);
    }

    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
            'emergency_contact' => 'nullable|string',
        ]);

        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'Employee profile not found.'], 404);
        }

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $totalDays = $start->diffInDays($end) + 1;

        $balance = LeaveBalance::where('employee_id', $employee->id)
            ->where('leave_type_id', $validated['leave_type_id'])
            ->where('year', date('Y'))
            ->first();

        if ($balance && $balance->remaining_days < $totalDays) {
            return response()->json([
                'status' => 'error',
                'message' => "Insufficient leave balance. You have {$balance->remaining_days} days remaining but requested {$totalDays} days.",
            ], 422);
        }

        $application = LeaveApplication::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $totalDays,
            'reason' => $validated['reason'],
            'emergency_contact' => $validated['emergency_contact'] ?? null,
            'status' => 'pending',
        ]);

        if ($balance) {
            $balance->increment('pending_days', $totalDays);
        }

        return response()->json([
            'status' => 'success',
            'message' => "Leave application for {$totalDays} days submitted successfully.",
            'data' => $application->load('leaveType'),
        ], 201);
    }

    public function processApplication(Request $request, LeaveApplication $leaveApplication): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approved,rejected',
            'remarks' => 'nullable|string',
        ]);

        $leaveApplication->update([
            'status' => $validated['action'],
            'approver_id' => $request->user()->id,
            'approver_remarks' => $validated['remarks'] ?? null,
            'approved_at' => Carbon::now(),
        ]);

        $balance = LeaveBalance::where('employee_id', $leaveApplication->employee_id)
            ->where('leave_type_id', $leaveApplication->leave_type_id)
            ->where('year', date('Y'))
            ->first();

        if ($balance) {
            $balance->decrement('pending_days', $leaveApplication->total_days);
            if ($validated['action'] === 'approved') {
                $balance->increment('used_days', $leaveApplication->total_days);
                $balance->decrement('remaining_days', $leaveApplication->total_days);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Leave application has been ' . $validated['action'] . '.',
            'data' => $leaveApplication->load(['employee', 'leaveType']),
        ]);
    }

    public function publicHolidays(): JsonResponse
    {
        $holidays = PublicHoliday::where('is_active', true)
            ->where('year', date('Y'))
            ->orderBy('date')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $holidays,
        ]);
    }
}
