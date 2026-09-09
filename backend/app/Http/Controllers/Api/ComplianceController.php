<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplianceDocument;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ComplianceDocument::with(['employee.department', 'employee.designation', 'employee.branch']);

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'expired') {
                $query->where('expiry_date', '<', Carbon::now()->format('Y-m-d'));
            } elseif ($status === 'expiring_soon') {
                $query->where('expiry_date', '>=', Carbon::now()->format('Y-m-d'))
                    ->where('expiry_date', '<=', Carbon::now()->addDays(90)->format('Y-m-d'));
            } elseif ($status === 'valid') {
                $query->where('expiry_date', '>', Carbon::now()->addDays(90)->format('Y-m-d'));
            }
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $documents = $query->orderBy('expiry_date', 'asc')->paginate(25);

        return response()->json([
            'status' => 'success',
            'data' => $documents,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'document_type' => 'required|in:Passport,Visa,Emirates ID,Labour Card,Medical Insurance,Other',
            'document_number' => 'required|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'issuing_authority' => 'nullable|string|max:255',
            'sponsor_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $days = (int) Carbon::now()->diffInDays(Carbon::parse($validated['expiry_date']), false);
        $status = 'valid';
        if ($days < 0) {
            $status = 'expired';
        } elseif ($days <= 90) {
            $status = 'expiring_soon';
        }

        $validated['status'] = $status;

        $doc = ComplianceDocument::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Compliance document recorded successfully',
            'data' => $doc->load('employee'),
        ], 201);
    }

    public function update(Request $request, ComplianceDocument $complianceDocument): JsonResponse
    {
        $validated = $request->validate([
            'document_type' => 'required|in:Passport,Visa,Emirates ID,Labour Card,Medical Insurance,Other',
            'document_number' => 'required|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'issuing_authority' => 'nullable|string|max:255',
            'sponsor_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $days = (int) Carbon::now()->diffInDays(Carbon::parse($validated['expiry_date']), false);
        $status = 'valid';
        if ($days < 0) {
            $status = 'expired';
        } elseif ($days <= 90) {
            $status = 'expiring_soon';
        }

        $validated['status'] = $status;
        $complianceDocument->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Document details updated successfully',
            'data' => $complianceDocument->load('employee'),
        ]);
    }

    public function alerts(): JsonResponse
    {
        $critical = ComplianceDocument::with(['employee.department'])
            ->where('expiry_date', '<=', Carbon::now()->addDays(30)->format('Y-m-d'))
            ->orderBy('expiry_date', 'asc')
            ->get();

        $warning = ComplianceDocument::with(['employee.department'])
            ->where('expiry_date', '>', Carbon::now()->addDays(30)->format('Y-m-d'))
            ->where('expiry_date', '<=', Carbon::now()->addDays(90)->format('Y-m-d'))
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'critical_30_days' => $critical,
                'warning_90_days' => $warning,
                'total_alerts' => $critical->count() + $warning->count(),
            ],
        ]);
    }
}
