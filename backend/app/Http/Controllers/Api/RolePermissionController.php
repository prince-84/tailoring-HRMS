<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    public function roles(): JsonResponse
    {
        $roles = Role::with('permissions')->withCount('users')->get();

        return response()->json([
            'status' => 'success',
            'data' => $roles,
        ]);
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy('module');

        return response()->json([
            'status' => 'success',
            'data' => $permissions,
        ]);
    }

    public function updateRolePermissions(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permission_ids']);

        return response()->json([
            'status' => 'success',
            'message' => "Permissions for role '{$role->name}' updated successfully.",
            'data' => $role->load('permissions'),
        ]);
    }
}
