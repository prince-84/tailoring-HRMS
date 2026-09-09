<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ComplianceDocument;
use App\Models\Employee;
use App\Models\LeaveApplication;
use App\Models\PayrollRun;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function employeeMaster(Request $request): JsonResponse
    {
        $total = Employee::count();
        $emiratiCount = Employee::where('nationality', 'like', '%United Arab Emirates%')->orWhere('nationality', 'like', '%Emirati%')->count();
        $emiratizationRate = $total > 0 ? round(($emiratiCount / $total) * 100, 1) : 0;

        $byGender = Employee::selectRaw('gender, count(*) as count')->groupBy('gender')->get();
        $byNationality = Employee::selectRaw('nationality, count(*) as count')->groupBy('nationality')->orderBy('count', 'desc')->get();
        $byDepartment = Employee::with('department')->selectRaw('department_id, count(*) as count')->groupBy('department_id')->get()->map(function ($item) {
            return [
                'department' => $item->department?->name ?? 'Unassigned',
                'count' => $item->count,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_headcount' => $total,
                'emirati_headcount' => $emiratiCount,
                'emiratization_percentage' => $emiratizationRate,
                'by_gender' => $byGender,
                'by_nationality' => $byNationality,
                'by_department' => $byDepartment,
            ],
        ]);
    }

    public function attendanceReport(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::today()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::today()->format('Y-m-d'));

        $query = Attendance::with(['employee.department', 'shift'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($request->filled('department_id')) {
            $deptId = $request->department_id;
            $query->whereHas('employee', function ($q) use ($deptId) {
                $q->where('department_id', $deptId);
            });
        }

        $records = $query->orderBy('date', 'desc')->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $records,
        ]);
    }

    public function leaveReport(Request $request): JsonResponse
    {
        $year = $request->get('year', date('Y'));

        $applications = LeaveApplication::with(['employee.department', 'leaveType'])
            ->whereYear('start_date', $year)
            ->orderBy('start_date', 'desc')
            ->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $applications,
        ]);
    }
}
