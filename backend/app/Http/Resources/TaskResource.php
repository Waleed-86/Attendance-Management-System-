<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->due_date->format('Y-m-d'),
            'priority' => $this->priority,
            'status' => $this->status,
            'assignee' => [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ],
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'latest_submission' => $this->whenLoaded(
                'latestSubmission',
                fn () => $this->latestSubmission
                    ? new TaskSubmissionResource($this->latestSubmission)
                    : null
            ),
            'created_at' => $this->created_at,
        ];
    }
}