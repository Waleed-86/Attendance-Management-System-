<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    /**
     * List all attendance records with filters.
     */
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:present,absent,leave',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'search' => 'nullable|string|max:100',
        ]);

        $query = Attendance::with('user');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('date', '<=', $request->to_date);
        }
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $records = $query->orderByDesc('date')->orderByDesc('time')->paginate(20);

        return response()->json([
            'data' => AttendanceResource::collection($records),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'total' => $records->total(),
                'present_today' => Attendance::whereDate('date', now()->toDateString())
                    ->where('status', 'present')->count(),
            ],
        ]);
    }

    /**
     * Manually add an attendance record for a user.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date|before_or_equal:today',
            'time' => 'required|date_format:H:i',
            'status' => 'required|in:present,absent,leave',
        ]);

        $exists = Attendance::where('user_id', $data['user_id'])
            ->where('date', $data['date'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'An attendance record already exists for this user on this date.',
            ], 409);
        }

        $attendance = Attendance::create([
            ...$data,
            'marked_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Attendance record added successfully.',
            'data' => new AttendanceResource($attendance->load('user')),
        ], 201);
    }

    /**
     * Edit an existing attendance record.
     */
    public function update(Request $request, Attendance $attendance)
    {
        $data = $request->validate([
            'date' => 'sometimes|date|before_or_equal:today',
            'time' => 'sometimes|date_format:H:i',
            'status' => 'sometimes|in:present,absent,leave',
        ]);

        // If date is being changed, re-check for duplicates
        if (isset($data['date']) && $data['date'] !== $attendance->date->format('Y-m-d')) {
            $exists = Attendance::where('user_id', $attendance->user_id)
                ->where('date', $data['date'])
                ->where('id', '!=', $attendance->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This user already has an attendance record on that date.',
                ], 409);
            }
        }

        $attendance->update($data);

        return response()->json([
            'message' => 'Attendance record updated successfully.',
            'data' => new AttendanceResource($attendance->fresh('user')),
        ]);
    }

    /**
     * Delete an attendance record.
     */
    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return response()->json([
            'message' => 'Attendance record deleted successfully.',
        ]);
    }

    /**
     * List of users for the filter dropdown.
     */
    public function users()
    {
        $users = User::where('is_active', true)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $users]);
    }
}