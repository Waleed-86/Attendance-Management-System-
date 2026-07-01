<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\SubmitTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskSubmission;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Logged-in user's assigned tasks.
     */
    public function myTasks(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,in_progress,submitted,approved,rejected',
        ]);

        $query = Task::with(['creator', 'latestSubmission'])
            ->where('assigned_to', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'total' => $tasks->total(),
                'pending_count' => (clone $query)->whereIn('status', ['pending', 'in_progress'])->count(),
            ],
        ]);
    }

    /**
     * View a single task (must belong to the user).
     */
    public function show(Request $request, Task $task)
    {
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $task->load(['creator', 'submissions.reviewedBy']);

        return response()->json(['data' => new TaskResource($task)]);
    }

    /**
     * Mark task as "in progress" (optional UX step before submitting).
     */
    public function start(Request $request, Task $task)
    {
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($task->status !== 'pending') {
            return response()->json(['message' => 'Task cannot be started from its current state.'], 409);
        }

        $task->update(['status' => 'in_progress']);

        return response()->json([
            'message' => 'Task marked as in progress.',
            'data' => new TaskResource($task->fresh(['creator', 'latestSubmission'])),
        ]);
    }

    /**
     * Submit a response for the task.
     */
    public function submit(SubmitTaskRequest $request, Task $task)
    {
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! in_array($task->status, ['pending', 'in_progress', 'rejected'])) {
            return response()->json([
                'message' => 'This task cannot be submitted from its current state.',
            ], 409);
        }

        TaskSubmission::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'response' => $request->validated()['response'],
        ]);

        $task->update(['status' => 'submitted']);

        // TODO (Step 13+): dispatch WhatsApp notification job to admin here

        return response()->json([
            'message' => 'Task submitted successfully.',
            'data' => new TaskResource($task->fresh(['creator', 'latestSubmission'])),
        ]);
    }
}