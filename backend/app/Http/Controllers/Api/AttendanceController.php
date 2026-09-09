<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceRegularization;
use App\Models\Employee;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with(['employee.department', 'employee.designation', 'shift', 'regularization']);

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        } else {
            $query->where('date', Carbon::today()->format('Y-m-d'));
        }

        if ($request->filled('department_id')) {
            $deptId = $request->department_id;
            $query->whereHas('employee', function ($q) use ($deptId) {
                $q->where('department_id', $deptId);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('check_in', 'asc')->paginate($request->get('per_page', 25));

        return response()->json([
            'status' => 'success',
            'data' => $attendances,
        ]);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'No employee profile linked to current user.'], 404);
        }

        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        $existing = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();
        if ($existing && $existing->check_in) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already checked in for today at ' . $existing->check_in,
            ], 422);
        }

        $shift = $employee->shift ?? Shift::first();
        $lateMinutes = 0;
        $status = 'present';

        if ($shift) {
            $shiftStartTime = Carbon::parse($today . ' ' . $shift->start_time)->addMinutes($shift->grace_period_minutes);
            if ($now->greaterThan($shiftStartTime)) {
                $status = 'late';
                $lateMinutes = (int) $now->diffInMinutes(Carbon::parse($today . ' ' . $shift->start_time));
            }
        }

        $attendance = Attendance::updateOrCreate(
            ['employee_id' => $employee->id, 'date' => $today],
            [
                'shift_id' => $shift?->id,
                'check_in' => $now->format('H:i:s'),
                'check_in_latitude' => $request->latitude,
                'check_in_longitude' => $request->longitude,
                'check_in_ip' => $request->ip(),
                'status' => $status,
                'late_minutes' => $lateMinutes,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Checked in successfully at ' . $now->format('h:i A'),
            'data' => $attendance,
        ]);
    }

    public function checkOut(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'No employee profile found.'], 404);
        }

        $today = Carbon::today()->format('Y-m-d');
        $now = Carbon::now();

        $attendance = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json([
                'status' => 'error',
                'message' => 'You must check-in first before checking out.',
            ], 422);
        }

        $checkInTime = Carbon::parse($today . ' ' . $attendance->check_in);
        $workingHours = round($checkInTime->diffInMinutes($now) / 60, 2);

        $attendance->update([
            'check_out' => $now->format('H:i:s'),
            'check_out_latitude' => $request->latitude,
            'check_out_longitude' => $request->longitude,
            'check_out_ip' => $request->ip(),
            'working_hours' => $workingHours,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Checked out successfully at ' . $now->format('h:i A') . " (Total: {$workingHours} hrs)",
            'data' => $attendance,
        ]);
    }

    public function regularizations(): JsonResponse
    {
        $requests = AttendanceRegularization::with(['employee.department', 'attendance', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $requests,
        ]);
    }

    public function regularize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'regularization_date' => 'required|date',
            'requested_check_in' => 'required|string',
            'requested_check_out' => 'required|string',
            'request_type' => 'required|in:missed_check_in,missed_check_out,missed_both,late_regularization,manual_entry',
            'reason' => 'required|string',
        ]);

        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'Employee profile not found.'], 404);
        }

        $reg = AttendanceRegularization::create([
            'employee_id' => $employee->id,
            'regularization_date' => $validated['regularization_date'],
            'requested_check_in' => $validated['requested_check_in'],
            'requested_check_out' => $validated['requested_check_out'],
            'request_type' => $validated['request_type'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance regularization request submitted successfully.',
            'data' => $reg,
        ], 201);
    }

    public function approveRegularization(Request $request, AttendanceRegularization $regularization): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approved,rejected',
            'remarks' => 'nullable|string',
        ]);

        $regularization->update([
            'status' => $validated['action'],
            'approver_id' => $request->user()->id,
            'approval_remarks' => $validated['remarks'] ?? null,
            'approved_at' => Carbon::now(),
        ]);

        if ($validated['action'] === 'approved') {
            Attendance::updateOrCreate(
                [
                    'employee_id' => $regularization->employee_id,
                    'date' => $regularization->regularization_date,
                ],
                [
                    'check_in' => $regularization->requested_check_in,
                    'check_out' => $regularization->requested_check_out,
                    'status' => 'present',
                    'working_hours' => 8.0,
                    'notes' => 'Regularized: ' . $regularization->reason,
                ]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Regularization request has been ' . $validated['action'] . '.',
            'data' => $regularization,
        ]);
    }
}
