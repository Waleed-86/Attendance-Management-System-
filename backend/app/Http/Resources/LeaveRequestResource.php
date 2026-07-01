<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'leave_type' => $this->leave_type,
            'from_date' => $this->from_date->format('Y-m-d'),
            'to_date' => $this->to_date->format('Y-m-d'),
            'days_count' => $this->days_count,
            'reason' => $this->reason,
            'status' => $this->status,
            'admin_comment' => $this->admin_comment,
            'reviewed_by' => $this->whenLoaded('reviewedBy', fn () => $this->reviewedBy?->name),
            'reviewed_at' => $this->reviewed_at,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'created_at' => $this->created_at,
        ];
    }
}