<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User; // Make sure to import your User model

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Attempt to find the user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Revoke all existing tokens for this user (optional, good for single session per device)
        $user->tokens()->delete();

        // Reset the sequence to fix primary key constraint issues for personal_access_tokens
        $maxTokenId = \DB::table('personal_access_tokens')->max('id');
        if ($maxTokenId) {
            \DB::statement("SELECT setval('personal_access_tokens_id_seq', ?)", [$maxTokenId]);
        } else {
            \DB::statement("SELECT setval('personal_access_tokens_id_seq', 1, false)");
        }

        // Create a new token for the user
        // The token name can be anything descriptive, e.g., 'auth_token', 'api_token'
        $token = $user->createToken($request->email . '_AuthToken')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                // Add other user details you want to return
            ],
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        // Delete the current token being used
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.'
        ], 200);
    }

    public function signup(Request $request)
    {
        try {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
                'password_confirmation' => 'required',
            ]);

            // Reset the sequence to fix primary key constraint issues
            $maxId = \DB::table('users')->max('user_id');
            if ($maxId) {
                \DB::statement("SELECT setval('users_user_id_seq', ?)", [$maxId]);
            } else {
                \DB::statement("SELECT setval('users_user_id_seq', 1, false)");
            }

        $user = User::create([
            'email' => $request->email,
            'password' => $request->password, // Will be hashed automatically if using Laravel 9+ with 'hashed' cast
                'practice_type' => $request->practice_type ?? 'clinics', // Default to 'clinics' if not provided
                'registration_date' => now(), // Set registration date
        ]);

        $token = $user->createToken($request->email . '_AuthToken')->plainTextToken;

        return response()->json([
            'message' => 'Signup successful',
            'user' => [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'practice_type' => $user->practice_type,
            ],
            'token' => $token,
        ], 201);
        } catch (\Exception $e) {
            \Log::error('Signup error: ' . $e->getMessage());
            \Log::error('Request data: ' . json_encode($request->all()));
            
            return response()->json([
                'message' => 'Signup failed',
                'error' => $e->getMessage(),
                'data' => $request->all()
            ], 500);
        }
    }
}