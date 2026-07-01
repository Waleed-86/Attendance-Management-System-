<?php

namespace App\Http\Requests\Leave;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'leave_type' => ['required', 'in:sick,casual,annual,emergency,other'],
            'from_date' => ['required', 'date', 'after_or_equal:today'],
            'to_date' => ['required', 'date', 'after_or_equal:from_date'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'from_date.after_or_equal' => 'Leave cannot start in the past.',
            'to_date.after_or_equal' => 'End date must be on or after the start date.',
            'reason.min' => 'Please provide a more detailed reason (at least 10 characters).',
        ];
    }
}