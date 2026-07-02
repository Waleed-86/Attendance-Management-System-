<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'profile_picture',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

public function leaveRequests()
{
    return $this->hasMany(LeaveRequest::class);
}

public function assignedTasks()
{
    return $this->hasMany(Task::class, 'assigned_to');
}

public function createdTasks()
{
    return $this->hasMany(Task::class, 'created_by');
}

public function roleModel()
{
    return Role::where('slug', $this->role)->first();
}

public function hasPermission(string $key): bool
{
    if ($this->role === 'admin') {
        return true; // admin always has full access
    }

    $role = $this->roleModel();

    return $role ? $role->permissions()->where('key', $key)->exists() : false;
}


}