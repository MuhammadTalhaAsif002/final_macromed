<?php

namespace App\Http\Controllers;

use App\Models\Reviews;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // List all reviews
    public function index()
    {
        $reviews = Reviews::all();
        return response()->json($reviews);
    }

    // Show a single review
    public function show(Reviews $review)
    {
        return response()->json($review);
    }

    // Create a new review
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string',
            'is_verified_buyer' => 'boolean',
        ]);
        $validated['user_id'] = Auth::id();
        $validated['timestamp'] = now();
        $review = Reviews::create($validated);
        return response()->json($review, 201);
    }

    // Update a review
    public function update(Request $request, Reviews $review)
    {
        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'review_text' => 'nullable|string',
            'is_verified_buyer' => 'boolean',
        ]);
        $validated['user_id'] = Auth::id();
        if (!isset($validated['timestamp'])) {
            $validated['timestamp'] = now();
        }
        $review->update($validated);
        return response()->json($review);
    }

    // Delete a review
    public function destroy(Reviews $review)
    {
        $review->delete();
        return response()->json(['message' => 'Review deleted successfully']);
    }
} 