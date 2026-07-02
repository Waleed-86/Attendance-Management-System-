<?php

namespace Database\Seeders;

use App\Models\GradeSetting;
use Illuminate\Database\Seeder;

class GradeSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['grade' => 'A', 'min_days' => 26, 'max_days' => null],
            ['grade' => 'B', 'min_days' => 20, 'max_days' => 25],
            ['grade' => 'C', 'min_days' => 15, 'max_days' => 19],
            ['grade' => 'D', 'min_days' => 10, 'max_days' => 14],
            ['grade' => 'F', 'min_days' => 0, 'max_days' => 9],
        ];

        foreach ($defaults as $d) {
            GradeSetting::updateOrCreate(['grade' => $d['grade']], $d);
        }
    }
}