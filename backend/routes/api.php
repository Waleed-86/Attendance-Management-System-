<?php

use App\Http\Controllers\Api\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\GradeSettingController;
use App\Http\Controllers\Api\Admin\LeaveController as AdminLeaveController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {

    // Dashboards
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/admin/dashboard/stats', [AdminDashboardController::class, 'stats']);

    // Profile
    Route::prefix('profile')->group(function () {
        Route::post('/', [ProfileController::class, 'update']); // POST because of file upload
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
    });

    // Attendance (user-facing)
    Route::prefix('attendance')->group(function () {
        Route::post('/mark', [AttendanceController::class, 'mark']);
        Route::get('/today', [AttendanceController::class, 'today']);
        Route::get('/history', [AttendanceController::class, 'history']);
    });

    // Leave (user-facing)
    Route::prefix('leave')->group(function () {
        Route::post('/', [LeaveController::class, 'store']);
        Route::get('/my', [LeaveController::class, 'myLeaves']);
    });

    // Leave (admin)
    Route::prefix('admin/leave')->middleware('permission:leave.view_all')->group(function () {
        Route::get('/', [AdminLeaveController::class, 'index']);
        Route::patch('/{leaveRequest}/review', [AdminLeaveController::class, 'review'])
            ->middleware('permission:leave.approve');
    });

    // Tasks (user-facing)
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'myTasks']);
        Route::get('/{task}', [TaskController::class, 'show']);
        Route::post('/{task}/start', [TaskController::class, 'start']);
        Route::post('/{task}/submit', [TaskController::class, 'submit']);
    });

    // Tasks (admin)
    Route::prefix('admin/tasks')->middleware('permission:tasks.assign')->group(function () {
        Route::get('/assignable-users', [AdminTaskController::class, 'assignableUsers']);
        Route::get('/', [AdminTaskController::class, 'index']);
        Route::post('/', [AdminTaskController::class, 'store']);
        Route::patch('/{task}/review', [AdminTaskController::class, 'review'])
            ->middleware('permission:tasks.approve');
    });

    // Roles & Permissions (admin)
    Route::prefix('admin/roles')->middleware('permission:roles.manage')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::patch('/{role}', [RoleController::class, 'update']);
        Route::delete('/{role}', [RoleController::class, 'destroy']);
        Route::patch('/users/{user}/assign', [RoleController::class, 'assignToUser']);
    });

    // Attendance (admin)
    Route::prefix('admin/attendance')->middleware('permission:attendance.view')->group(function () {
        Route::get('/', [AdminAttendanceController::class, 'index']);
        Route::get('/users', [AdminAttendanceController::class, 'users']);
        Route::post('/', [AdminAttendanceController::class, 'store'])
            ->middleware('permission:attendance.edit');
        Route::patch('/{attendance}', [AdminAttendanceController::class, 'update'])
            ->middleware('permission:attendance.edit');
        Route::delete('/{attendance}', [AdminAttendanceController::class, 'destroy'])
            ->middleware('permission:attendance.delete');
    });

    // Users (admin)
    Route::prefix('admin/users')->middleware('permission:users.manage')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::post('/', [AdminUserController::class, 'store']);
        Route::get('/{user}', [AdminUserController::class, 'show']);
        Route::patch('/{user}', [AdminUserController::class, 'update']);
        Route::delete('/{user}', [AdminUserController::class, 'destroy']);
    });

    // Reports (admin)
    Route::prefix('admin/reports')->middleware('permission:reports.view')->group(function () {
        Route::get('/individual', [ReportController::class, 'individual']);
        Route::get('/system', [ReportController::class, 'system']);
        Route::get('/export', [ReportController::class, 'export'])
            ->middleware('permission:reports.export');
    });

    // Grade Settings (admin)
    Route::prefix('admin/grade-settings')->middleware('permission:reports.view')->group(function () {
        Route::get('/', [GradeSettingController::class, 'index']);
        Route::patch('/', [GradeSettingController::class, 'update']);
    });

});