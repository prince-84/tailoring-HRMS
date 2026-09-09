<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index(): JsonResponse
    {
        $shifts = Shift::withCount('employees')->get();

        return response()->json([
            'status' => 'success',
            'data' => $shifts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shifts,code',
            'start_time' => 'required',
            'end_time' => 'required',
            'break_minutes' => 'required|integer|min:0',
            'grace_period_minutes' => 'required|integer|min:0',
            'work_days' => 'nullable|array',
            'is_rotational' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        $shift = Shift::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Shift created successfully',
            'data' => $shift,
        ], 201);
    }

    public function update(Request $request, Shift $shift): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shifts,code,' . $shift->id,
            'start_time' => 'required',
            'end_time' => 'required',
            'break_minutes' => 'required|integer|min:0',
            'grace_period_minutes' => 'required|integer|min:0',
            'work_days' => 'nullable|array',
            'is_rotational' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        $shift->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Shift updated successfully',
            'data' => $shift,
        ]);
    }
}
