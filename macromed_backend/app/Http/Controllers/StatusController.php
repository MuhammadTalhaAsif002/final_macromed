<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StatusController extends Controller
{
    /**
     * Respond with an API status message.
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'API is alive and healthy!',
            'timestamp' => now()->toDateTimeString()
        ], 200);
    }
}