<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_settings', function (Blueprint $table) {
            $table->id();
            $table->string('grade', 1);     // A, B, C, D, F
            $table->unsignedInteger('min_days');
            $table->unsignedInteger('max_days')->nullable(); // null = no upper limit
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_settings');
    }
};