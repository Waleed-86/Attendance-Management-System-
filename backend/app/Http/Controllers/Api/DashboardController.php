<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\GradeSetting;
use App\Models\LeaveRequest;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        $presentDays = Attendance::where('user_id', $user->id)->where('status', 'present')->count();
        $absentDays = Attendance::where('user_id', $user->id)->where('status', 'absent')->count();
        $leaveDays = LeaveRequest::where('user_id', $user->id)
            ->where('status', 'approved')
            ->get()
            ->sum(fn ($l) => $l->days_count);

        $grade = GradeSetting::calculateGrade($presentDays);

        $cards = [
            'present_days' => $presentDays,
            'absent_days' => $absentDays,
            'leave_days' => $leaveDays,
            'grade' => $grade,
            'assigned_tasks' => Task::where('assigned_to', $user->id)->count(),
            'pending_tasks' => Task::where('assigned_to', $user->id)
                ->whereIn('status', ['pending', 'in_progress'])->count(),
            'completed_tasks' => Task::where('assigned_to', $user->id)
                ->where('status', 'approved')->count(),
        ];

        $recentAttendance = Attendance::with('user')
            ->where('user_id', $user->id)
            ->orderByDesc('date')
            ->limit(5)
            ->get();

        $leaveStatusCounts = [
            'pending' => LeaveRequest::where('user_id', $user->id)->where('status', 'pending')->count(),
            'approved' => LeaveRequest::where('user_id', $user->id)->where('status', 'approved')->count(),
            'rejected' => LeaveRequest::where('user_id', $user->id)->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'data' => [
                'cards' => $cards,
                'recent_attendance' => AttendanceResource::collection($recentAttendance),
                'leave_status' => $leaveStatusCounts,
            ],
        ]);
    }
}