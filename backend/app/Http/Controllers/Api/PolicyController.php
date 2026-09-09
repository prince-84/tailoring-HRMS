<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use App\Models\PolicyAcknowledgement;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PolicyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        $policies = Policy::where('is_active', true)
            ->with(['creator', 'acknowledgements' => function ($q) use ($employee) {
                if ($employee) {
                    $q->where('employee_id', $employee->id);
                }
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($policy) use ($employee) {
                $acknowledged = false;
                $acknowledgedAt = null;
                if ($employee && $policy->acknowledgements->isNotEmpty()) {
                    $acknowledged = true;
                    $acknowledgedAt = $policy->acknowledgements->first()->acknowledged_at?->format('Y-m-d H:i');
                }

                return [
                    'id' => $policy->id,
                    'title' => $policy->title,
                    'category' => $policy->category,
                    'version' => $policy->version,
                    'description' => $policy->description,
                    'effective_date' => $policy->effective_date?->format('Y-m-d'),
                    'document_path' => $policy->document_path,
                    'is_acknowledged' => $acknowledged,
                    'acknowledged_at' => $acknowledgedAt,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $policies,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'version' => 'required|string|max:50',
            'description' => 'required|string',
            'effective_date' => 'required|date',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['is_active'] = true;

        $policy = Policy::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Policy published successfully',
            'data' => $policy,
        ], 201);
    }

    public function acknowledge(Request $request, Policy $policy): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['status' => 'error', 'message' => 'Employee profile not found.'], 404);
        }

        $ack = PolicyAcknowledgement::updateOrCreate(
            [
                'policy_id' => $policy->id,
                'employee_id' => $employee->id,
            ],
            [
                'user_id' => $user->id,
                'acknowledged_at' => Carbon::now(),
                'ip_address' => $request->ip(),
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => "You have acknowledged policy '{$policy->title}'.",
            'data' => $ack,
        ]);
    }
}
