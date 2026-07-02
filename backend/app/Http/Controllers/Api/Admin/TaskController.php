<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(protected NotificationService $notifications) {}

    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,in_progress,submitted,approved,rejected',
            'priority' => 'nullable|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'search' => 'nullable|string|max:100',
        ]);

        $query = Task::with(['assignee', 'creator', 'latestSubmission']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $tasks = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'total' => $tasks->total(),
                'submitted_count' => Task::where('status', 'submitted')->count(),
            ],
        ]);
    }

    public function store(StoreTaskRequest $request)
    {
        $task = Task::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        $task->load('assignee');
        $this->notifications->taskAssigned(
            $task->assignee,
            $task->title,
            $task->due_date->format('Y-m-d'),
        );

        return response()->json([
            'message' => 'Task assigned successfully.',
            'data' => new TaskResource($task->load('creator')),
        ], 201);
    }

    public function review(Request $request, Task $task)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_feedback' => 'nullable|string|max:1000',
        ]);

        if ($task->status !== 'submitted') {
            return response()->json([
                'message' => 'Only submitted tasks can be reviewed.',
            ], 409);
        }

        $submission = $task->latestSubmission;
        $submission?->update([
            'admin_feedback' => $request->admin_feedback,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $task->update(['status' => $request->status]);
        $task->load('assignee');

        if ($request->status === 'approved') {
            $this->notifications->taskApproved($task->assignee, $task->title);
        } else {
            $this->notifications->taskRejected($task->assignee, $task->title, $request->admin_feedback);
        }

        return response()->json([
            'message' => "Task {$request->status} successfully.",
            'data' => new TaskResource($task->fresh(['assignee', 'creator', 'latestSubmission'])),
        ]);
    }

    public function assignableUsers()
    {
        $users = User::where('role', '!=', 'admin')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $users]);
    }
}