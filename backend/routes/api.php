<?php

use App\Http\Controllers\Api\Admin\LeaveController as AdminLeaveController;
use App\Http\Controllers\Api\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveController;
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

    Route::prefix('attendance')->group(function () {
        Route::post('/mark', [AttendanceController::class, 'mark']);
        Route::get('/today', [AttendanceController::class, 'today']);
        Route::get('/history', [AttendanceController::class, 'history']);
    });

    Route::prefix('leave')->group(function () {
        Route::post('/', [LeaveController::class, 'store']);
        Route::get('/my', [LeaveController::class, 'myLeaves']);
    });

    Route::prefix('admin/leave')->group(function () {
        Route::get('/', [AdminLeaveController::class, 'index']);
        Route::patch('/{leaveRequest}/review', [AdminLeaveController::class, 'review']);
    });

    // User-facing task routes
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'myTasks']);
        Route::get('/{task}', [TaskController::class, 'show']);
        Route::post('/{task}/start', [TaskController::class, 'start']);
        Route::post('/{task}/submit', [TaskController::class, 'submit']);
    });

    // Admin task routes
    Route::prefix('admin/tasks')->group(function () {
        Route::get('/assignable-users', [AdminTaskController::class, 'assignableUsers']);
        Route::get('/', [AdminTaskController::class, 'index']);
        Route::post('/', [AdminTaskController::class, 'store']);
        Route::patch('/{task}/review', [AdminTaskController::class, 'review']);
    });

});