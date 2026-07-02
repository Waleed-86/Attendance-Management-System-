<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreLeaveRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function __construct(protected NotificationService $notifications) {}

    /**
     * Submit a new leave request.
     */
    public function store(StoreLeaveRequest $request)
    {
        $data = $request->validated();

        $overlap = LeaveRequest::where('user_id', $request->user()->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($data) {
                $q->whereBetween('from_date', [$data['from_date'], $data['to_date']])
                  ->orWhereBetween('to_date', [$data['from_date'], $data['to_date']])
                  ->orWhere(function ($q2) use ($data) {
                      $q2->where('from_date', '<=', $data['from_date'])
                         ->where('to_date', '>=', $data['to_date']);
                  });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'You already have a leave request overlapping these dates.',
            ], 409);
        }

        $leave = LeaveRequest::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        // Notify all admins about the new leave request
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $this->notifications->leaveSubmitted($admin, $request->user(), $data['leave_type']);
        }

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'data' => new LeaveRequestResource($leave->load('user')),
        ], 201);
    }

    /**
     * Logged-in user's own leave history.
     */
    public function myLeaves(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $query = LeaveRequest::with(['user', 'reviewedBy'])
            ->where('user_id', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $leaves = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'data' => LeaveRequestResource::collection($leaves),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'total' => $leaves->total(),
            ],
        ]);
    }
}