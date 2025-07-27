<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Make sure this trait is used

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens; // Ensure HasApiTokens is here

    protected $table = 'users';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'email',
        'password', // Add 'password' here
        'first_name',
        'last_name',
        'registration_date',
        'last_login_date',
        'medical_specialty',
        'practice_type',
        'location',
        'organization_name',
        'user_segment',
        'preferred_brands',
    ];

    protected $hidden = [
        'password', // Ensure 'password' is hidden
        'remember_token', // If you use this
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'last_login_date' => 'datetime',
        // 'email_verified_at' => 'datetime', // If you add this column
        'password' => 'hashed', // Cast password to hashed for automatic hashing on assignment (Laravel 9+)
    ];
}