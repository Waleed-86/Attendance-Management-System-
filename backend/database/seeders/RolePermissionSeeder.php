<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Attendance
            ['key' => 'attendance.mark', 'group' => 'attendance', 'label' => 'Mark Attendance'],
            ['key' => 'attendance.view', 'group' => 'attendance', 'label' => 'View Attendance'],
            ['key' => 'attendance.edit', 'group' => 'attendance', 'label' => 'Edit Attendance'],
            ['key' => 'attendance.delete', 'group' => 'attendance', 'label' => 'Delete Attendance'],

            // Leave
            ['key' => 'leave.apply', 'group' => 'leave', 'label' => 'Apply for Leave'],
            ['key' => 'leave.approve', 'group' => 'leave', 'label' => 'Approve Leave'],
            ['key' => 'leave.reject', 'group' => 'leave', 'label' => 'Reject Leave'],
            ['key' => 'leave.view_all', 'group' => 'leave', 'label' => 'View All Leave Requests'],

            // Tasks
            ['key' => 'tasks.assign', 'group' => 'tasks', 'label' => 'Assign Tasks'],
            ['key' => 'tasks.submit', 'group' => 'tasks', 'label' => 'Submit Tasks'],
            ['key' => 'tasks.approve', 'group' => 'tasks', 'label' => 'Approve/Reject Tasks'],

            // Reports
            ['key' => 'reports.view', 'group' => 'reports', 'label' => 'View Reports'],
            ['key' => 'reports.export', 'group' => 'reports', 'label' => 'Export Reports'],

            // Users & Roles
            ['key' => 'users.manage', 'group' => 'users', 'label' => 'Manage Users'],
            ['key' => 'roles.manage', 'group' => 'roles', 'label' => 'Manage Roles & Permissions'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(['key' => $perm['key']], $perm);
        }

        $allPermissionIds = Permission::pluck('id');
        $basicPermissionKeys = ['attendance.mark', 'attendance.view', 'leave.apply', 'tasks.submit'];
        $basicPermissionIds = Permission::whereIn('key', $basicPermissionKeys)->pluck('id');

        $admin = Role::updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrator', 'is_system' => true]
        );
        $admin->permissions()->sync($allPermissionIds);

        $student = Role::updateOrCreate(
            ['slug' => 'student'],
            ['name' => 'Student', 'is_system' => true]
        );
        $student->permissions()->sync($basicPermissionIds);

        $teacher = Role::updateOrCreate(
            ['slug' => 'teacher'],
            ['name' => 'Teacher', 'is_system' => true]
        );
        $teacher->permissions()->sync($basicPermissionIds);

        $hr = Role::updateOrCreate(
            ['slug' => 'hr'],
            ['name' => 'HR', 'is_system' => true]
        );
        $hr->permissions()->sync(
            Permission::whereIn('key', [...$basicPermissionKeys, 'leave.approve', 'leave.reject', 'leave.view_all', 'reports.view'])
                ->pluck('id')
        );
    }
}