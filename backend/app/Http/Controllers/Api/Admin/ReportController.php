<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\AttendanceReportExport;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\GradeSetting;
use App\Models\LeaveRequest;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Individual report for a single user.
     */
    public function individual(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        $summary = $this->buildUserSummary(
            $data['user_id'], $data['from_date'], $data['to_date']
        );

        return response()->json(['data' => $summary]);
    }

    /**
     * Complete system report — every user.
     */
    public function system(Request $request)
    {
        $data = $request->validate([
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        $users = User::where('is_active', true)->get();

        $rows = $users->map(function ($user) use ($data) {
            return $this->buildUserSummary($user->id, $data['from_date'], $data['to_date']);
        });

        return response()->json(['data' => $rows]);
    }

    /**
     * Export individual or system report.
     */
    public function export(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:individual,system',
            'format' => 'required|in:pdf,excel,csv',
            'user_id' => 'required_if:type,individual|exists:users,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);

        if ($data['type'] === 'individual') {
            $rows = [$this->buildUserSummary($data['user_id'], $data['from_date'], $data['to_date'])];
        } else {
            $users = User::where('is_active', true)->get();
            $rows = $users->map(fn ($u) => $this->buildUserSummary($u->id, $data['from_date'], $data['to_date']))->toArray();
        }

        $headings = ['Name', 'Email', 'Present', 'Absent', 'Leave', 'Percentage', 'Grade'];
        $tableRows = collect($rows)->map(fn ($r) => [
            $r['user']['name'], $r['user']['email'], $r['present'],
            $r['absent'], $r['leave'], $r['percentage'] . '%', $r['grade'],
        ])->toArray();

        $filename = ($data['type'] === 'individual' ? 'attendance-report' : 'system-attendance-report')
            . '-' . now()->format('Y-m-d');

        if ($data['format'] === 'pdf') {
            $pdf = Pdf::loadView('reports.attendance-pdf', [
                'rows' => $rows,
                'from' => $data['from_date'],
                'to' => $data['to_date'],
            ]);
            return $pdf->download("{$filename}.pdf");
        }

        if ($data['format'] === 'csv') {
            return Excel::download(new AttendanceReportExport($tableRows, $headings), "{$filename}.csv", \Maatwebsite\Excel\Excel::CSV);
        }

        return Excel::download(new AttendanceReportExport($tableRows, $headings), "{$filename}.xlsx");
    }

    /**
     * Shared logic: compute a user's attendance summary for a date range.
     */
    private function buildUserSummary(int $userId, string $fromDate, string $toDate): array
    {
        $user = User::findOrFail($userId);

        $present = Attendance::where('user_id', $userId)
            ->where('status', 'present')
            ->whereBetween('date', [$fromDate, $toDate])
            ->count();

        $absent = Attendance::where('user_id', $userId)
            ->where('status', 'absent')
            ->whereBetween('date', [$fromDate, $toDate])
            ->count();

        $leave = LeaveRequest::where('user_id', $userId)
            ->where('status', 'approved')
            ->whereBetween('from_date', [$fromDate, $toDate])
            ->count();

        $totalDays = max(1, \Carbon\Carbon::parse($fromDate)->diffInDays(\Carbon\Carbon::parse($toDate)) + 1);
        $percentage = round(($present / $totalDays) * 100, 1);
        $grade = GradeSetting::calculateGrade($present);

        return [
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            'present' => $present,
            'absent' => $absent,
            'leave' => $leave,
            'total_days' => $totalDays,
            'percentage' => $percentage,
            'grade' => $grade,
        ];
    }
}