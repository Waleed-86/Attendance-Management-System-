<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * List all roles (with permissions) and all available permissions.
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();

        $permissions = Permission::orderBy('group')->orderBy('label')->get()
            ->groupBy('group');

        return response()->json([
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Create a new custom role.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $slug = Str::slug($data['name']);

        if (Role::where('slug', $slug)->exists()) {
            return response()->json([
                'message' => 'A role with a similar name already exists.',
            ], 409);
        }

        $role = Role::create([
            'name' => $data['name'],
            'slug' => $slug,
            'is_system' => false,
        ]);

        $role->permissions()->sync($data['permissions']);

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => $role->load('permissions'),
        ], 201);
    }

    /**
     * Update a role's name and/or permissions.
     */
    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:100'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        if (isset($data['name']) && ! $role->is_system) {
            $role->update(['name' => $data['name']]);
        }

        $role->permissions()->sync($data['permissions']);

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Delete a custom role (system roles cannot be deleted).
     */
    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return response()->json([
                'message' => 'System roles cannot be deleted.',
            ], 403);
        }

        if (User::where('role', $role->slug)->exists()) {
            return response()->json([
                'message' => 'Cannot delete a role that is assigned to users. Reassign those users first.',
            ], 409);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    /**
     * Assign a role to a user.
     */
    public function assignToUser(Request $request, User $user)
    {
        $data = $request->validate([
            'role_slug' => ['required', 'exists:roles,slug'],
        ]);

        $user->update(['role' => $data['role_slug']]);

        return response()->json([
            'message' => "Role updated for {$user->name}.",
            'data' => $user->fresh(),
        ]);
    }
}