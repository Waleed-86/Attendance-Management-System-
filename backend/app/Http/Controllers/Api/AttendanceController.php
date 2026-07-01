<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    /**
     * Mark today's attendance for the logged-in user.
     */
    public function mark(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $existing = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Attendance has already been marked for today.',
            ], 409);
        }

        try {
            $attendance = DB::transaction(function () use ($user, $today) {
                return Attendance::create([
                    'user_id' => $user->id,
                    'date' => $today,
                    'time' => now()->toTimeString(),
                    'status' => 'present',
                    'marked_by' => $user->id,
                ]);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Catches the DB unique constraint as a final safety net
            return response()->json([
                'message' => 'Attendance has already been marked for today.',
            ], 409);
        }

        return response()->json([
            'message' => 'Attendance marked successfully.',
            'data' => new AttendanceResource($attendance->load('user')),
        ], 201);
    }

    /**
     * Get today's attendance status for the logged-in user.
     */
    public function today(Request $request)
    {
        $attendance = Attendance::with('user')
            ->where('user_id', $request->user()->id)
            ->where('date', now()->toDateString())
            ->first();

        return response()->json([
            'data' => $attendance ? new AttendanceResource($attendance) : null,
            'marked' => (bool) $attendance,
        ]);
    }

    /**
     * Attendance history for the logged-in user, with filters.
     */
    public function history(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer|min:2000|max:2100',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
        ]);

        $query = Attendance::with('user')
            ->where('user_id', $request->user()->id);

        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('date', $request->month)
                  ->whereYear('date', $request->year);
        } elseif ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('date', '<=', $request->to_date);
        }

        $records = $query->orderByDesc('date')->paginate(15);

        $presentCount = (clone $query)->where('status', 'present')->count();

        return response()->json([
            'data' => AttendanceResource::collection($records),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'total' => $records->total(),
                'present_count' => $presentCount,
            ],
        ]);
    }
}