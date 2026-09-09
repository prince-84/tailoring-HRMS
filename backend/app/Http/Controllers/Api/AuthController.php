<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with(['role.permissions', 'branch', 'employee.department', 'employee.designation'])
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is deactivated. Please contact HR administration.',
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $permissions = [];
        if ($user->role) {
            $permissions = $user->role->permissions->pluck('slug')->toArray();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'slug' => $user->role->slug,
                ] : null,
                'branch' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->name,
                    'code' => $user->branch->code,
                    'city' => $user->branch->city,
                ] : null,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'code' => $user->employee->employee_code,
                    'first_name' => $user->employee->first_name,
                    'last_name' => $user->employee->last_name,
                    'full_name' => $user->employee->full_name,
                    'designation' => $user->employee->designation?->title,
                    'department' => $user->employee->department?->name,
                    'joining_date' => $user->employee->joining_date?->format('Y-m-d'),
                ] : null,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role.permissions', 'branch', 'employee.department', 'employee.designation']);

        $permissions = [];
        if ($user->role) {
            $permissions = $user->role->permissions->pluck('slug')->toArray();
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'slug' => $user->role->slug,
                ] : null,
                'branch' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->name,
                    'code' => $user->branch->code,
                    'city' => $user->branch->city,
                ] : null,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'code' => $user->employee->employee_code,
                    'first_name' => $user->employee->first_name,
                    'last_name' => $user->employee->last_name,
                    'full_name' => $user->employee->full_name,
                    'designation' => $user->employee->designation?->title,
                    'department' => $user->employee->department?->name,
                ] : null,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
