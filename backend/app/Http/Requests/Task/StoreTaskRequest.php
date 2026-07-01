<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'due_date' => ['required', 'date', 'after_or_equal:today'],
            'priority' => ['required', 'in:low,medium,high'],
            'assigned_to' => ['required', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after_or_equal' => 'Due date cannot be in the past.',
            'assigned_to.exists' => 'Selected user does not exist.',
        ];
    }
}