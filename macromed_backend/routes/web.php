<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-ping', function () {
    return response()->json(['message' => 'Test API is working!'], 200);
});