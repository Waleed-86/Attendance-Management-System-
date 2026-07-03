<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\GradeSetting;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->toDateString();

        $cards = [
            'total_users' => User::count(),
            'present_today' => Attendance::whereDate('date', $today)->where('status', 'present')->count(),
            'total_leave_requests' => LeaveRequest::count(),
            'pending_leaves' => LeaveRequest::where('status', 'pending')->count(),
            'total_tasks' => Task::count(),
            'pending_tasks' => Task::whereIn('status', ['pending', 'in_progress', 'submitted'])->count(),
            'completed_tasks' => Task::where('status', 'approved')->count(),
        ];

        // Attendance trend: last 7 days
        $attendanceTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo)->toDateString();
            return [
                'date' => $date,
                'label' => now()->subDays($daysAgo)->format('D'),
                'present' => Attendance::whereDate('date', $date)->where('status', 'present')->count(),
            ];
        });

        // Grade distribution across all users (based on all-time present days)
        $gradeSettings = GradeSetting::all();
        $users = User::where('role', '!=', 'admin')->get();

        $gradeDistribution = collect(['A', 'B', 'C', 'D', 'F'])->mapWithKeys(fn ($g) => [$g => 0])->toArray();

        foreach ($users as $user) {
            $presentDays = Attendance::where('user_id', $user->id)->where('status', 'present')->count();
            $grade = GradeSetting::calculateGrade($presentDays);
            if (isset($gradeDistribution[$grade])) {
                $gradeDistribution[$grade]++;
            }
        }

        return response()->json([
            'data' => [
                'cards' => $cards,
                'attendance_trend' => $attendanceTrend,
                'grade_distribution' => collect($gradeDistribution)->map(fn ($count, $grade) => [
                    'grade' => $grade,
                    'count' => $count,
                ])->values(),
            ],
        ]);
    }
}