<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::with(['branch', 'headOfDepartment', 'designations'])
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $departments,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code',
            'branch_id' => 'nullable|exists:branches,id',
            'head_of_department_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Department created successfully',
            'data' => $department->load(['branch', 'headOfDepartment']),
        ], 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code,' . $department->id,
            'branch_id' => 'nullable|exists:branches,id',
            'head_of_department_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $department->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Department updated successfully',
            'data' => $department->load(['branch', 'headOfDepartment']),
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        if ($department->employees()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete department with active assigned employees. Please reassign employees first.',
            ], 422);
        }

        $department->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Department deleted successfully',
        ]);
    }
}
