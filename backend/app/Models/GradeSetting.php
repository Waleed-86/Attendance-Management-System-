<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradeSetting extends Model
{
    use HasFactory;

    protected $fillable = ['grade', 'min_days', 'max_days'];

    /**
     * Calculate the grade for a given number of present days.
     */
    public static function calculateGrade(int $presentDays): string
    {
        $setting = static::orderByDesc('min_days')
            ->where('min_days', '<=', $presentDays)
            ->where(function ($q) use ($presentDays) {
                $q->whereNull('max_days')->orWhere('max_days', '>=', $presentDays);
            })
            ->first();

        return $setting?->grade ?? 'F';
    }
}