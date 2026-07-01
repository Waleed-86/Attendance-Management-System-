<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    /**
     * All leave requests, with filters (admin).
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,approved,rejected',
            'user_id' => 'nullable|exists:users,id',
            'search' => 'nullable|string|max:100',
        ]);

        $query = LeaveRequest::with(['user', 'reviewedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $leaves = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'data' => LeaveRequestResource::collection($leaves),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'total' => $leaves->total(),
                'pending_count' => LeaveRequest::where('status', 'pending')->count(),
            ],
        ]);
    }

    /**
     * Approve or reject a leave request.
     */
    public function review(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_comment' => 'nullable|string|max:1000',
        ]);

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This leave request has already been reviewed.',
            ], 409);
        }

        $leaveRequest->update([
            'status' => $request->status,
            'admin_comment' => $request->admin_comment,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // TODO (Step 12+): dispatch WhatsApp notification job here

        return response()->json([
            'message' => "Leave request {$request->status} successfully.",
            'data' => new LeaveRequestResource($leaveRequest->load(['user', 'reviewedBy'])),
        ]);
    }
}