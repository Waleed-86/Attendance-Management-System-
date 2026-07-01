<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'response' => $this->response,
            'admin_feedback' => $this->admin_feedback,
            'reviewed_by' => $this->whenLoaded('reviewedBy', fn () => $this->reviewedBy?->name),
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
        ];
    }
}