<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GradeSetting;
use Illuminate\Http\Request;

class GradeSettingController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => GradeSetting::orderByDesc('min_days')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'grades' => 'required|array|min:1',
            'grades.*.id' => 'required|exists:grade_settings,id',
            'grades.*.min_days' => 'required|integer|min:0',
            'grades.*.max_days' => 'nullable|integer|gte:grades.*.min_days',
        ]);

        foreach ($data['grades'] as $g) {
            GradeSetting::where('id', $g['id'])->update([
                'min_days' => $g['min_days'],
                'max_days' => $g['max_days'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Grading thresholds updated successfully.',
            'data' => GradeSetting::orderByDesc('min_days')->get(),
        ]);
    }
}