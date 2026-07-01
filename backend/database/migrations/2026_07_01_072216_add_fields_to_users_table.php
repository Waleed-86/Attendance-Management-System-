<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('profile_picture')->nullable()->after('phone');
            $table->enum('role', ['admin', 'student', 'teacher', 'hr'])
                ->default('student')
                ->after('profile_picture');
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'profile_picture', 'role', 'is_active']);
        });
    }
};