<?php

namespace App\Services;

use App\Jobs\SendWhatsAppNotification;
use App\Models\NotificationLog;
use App\Models\User;

class NotificationService
{
    public function notify(User $user, string $type, string $message): void
    {
        if (! $user->phone) {
            return; // no phone number on file, skip silently
        }

        SendWhatsAppNotification::dispatch($user->phone, $message);

        NotificationLog::create([
            'user_id' => $user->id,
            'type' => $type,
            'channel' => 'whatsapp',
            'message' => $message,
        ]);
    }

    public function attendanceMarked(User $user, string $date): void
    {
        $this->notify(
            $user,
            'attendance_marked',
            "Hi {$user->name}, your attendance has been marked as Present for {$date}."
        );
    }

    public function leaveSubmitted(User $admin, User $requester, string $leaveType): void
    {
        $this->notify(
            $admin,
            'leave_submitted',
            "New {$leaveType} leave request from {$requester->name} is awaiting your review."
        );
    }

    public function leaveApproved(User $user, string $leaveType, string $fromDate, string $toDate): void
    {
        $this->notify(
            $user,
            'leave_approved',
            "Hi {$user->name}, your {$leaveType} leave from {$fromDate} to {$toDate} has been approved."
        );
    }

    public function leaveRejected(User $user, string $leaveType, ?string $comment): void
    {
        $message = "Hi {$user->name}, your {$leaveType} leave request has been rejected.";
        if ($comment) {
            $message .= " Reason: {$comment}";
        }
        $this->notify($user, 'leave_rejected', $message);
    }

    public function taskAssigned(User $user, string $taskTitle, string $dueDate): void
    {
        $this->notify(
            $user,
            'task_assigned',
            "Hi {$user->name}, you've been assigned a new task: \"{$taskTitle}\" (due {$dueDate})."
        );
    }

    public function taskApproved(User $user, string $taskTitle): void
    {
        $this->notify(
            $user,
            'task_approved',
            "Hi {$user->name}, your submission for \"{$taskTitle}\" has been approved."
        );
    }

    public function taskRejected(User $user, string $taskTitle, ?string $feedback): void
    {
        $message = "Hi {$user->name}, your submission for \"{$taskTitle}\" was rejected.";
        if ($feedback) {
            $message .= " Feedback: {$feedback}";
        }
        $this->notify($user, 'task_rejected', $message);
    }
}