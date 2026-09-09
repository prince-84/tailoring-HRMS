<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesignationController extends Controller
{
    public function index(): JsonResponse
    {
        $designations = Designation::with('department')
            ->withCount('employees')
            ->orderBy('title')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $designations,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:designations,code',
            'department_id' => 'nullable|exists:departments,id',
            'level_grade' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $designation = Designation::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Designation created successfully',
            'data' => $designation->load('department'),
        ], 201);
    }

    public function update(Request $request, Designation $designation): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:designations,code,' . $designation->id,
            'department_id' => 'nullable|exists:departments,id',
            'level_grade' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $designation->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Designation updated successfully',
            'data' => $designation->load('department'),
        ]);
    }

    public function destroy(Designation $designation): JsonResponse
    {
        if ($designation->employees()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete designation assigned to employees.',
            ], 422);
        }

        $designation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Designation deleted successfully',
        ]);
    }
}
