<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\ProductController; // <--- ADD THIS LINE
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes for authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);

// TEST: Get all users (for debugging only, remove in production)
Route::get('/test-users', function () {
    return \App\Models\User::all();
});

// Public status/health check route
Route::get('/status', [StatusController::class, 'index']);

// Public Python API health check
Route::get('/python-api/health', [RecommendationController::class, 'health']);

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!', 'timestamp' => now()]);
});

// Public Product API Routes (no authentication required)
Route::post('/products/by-category', [ProductController::class, 'getByCategory']); // Custom Product route for getting by category
Route::get('/products/search', [ProductController::class, 'searchProducts']); // Route for searching products
Route::apiResource('/products', ProductController::class);

// Public Recommendation Routes (no authentication required)
Route::prefix('recommendations')->group(function () {
    Route::get('/content-based', [RecommendationController::class, 'contentBased']);
    Route::get('/price-based', [RecommendationController::class, 'priceBased']);
    Route::get('/hybrid', [RecommendationController::class, 'hybrid']);
    Route::delete('/cache', [RecommendationController::class, 'clearCache']);
});

// Public Interaction Insights & Analytics Routes (no authentication required)
Route::prefix('insights')->group(function () {
    Route::get('/analytics', [InteractionController::class, 'analytics']);
    Route::get('/recent', [InteractionController::class, 'recent']);
    Route::get('/recommendations', [InteractionController::class, 'recommendations']);
    Route::get('/you-also-viewed', [InteractionController::class, 'youAlsoViewed']);
    Route::get('/frequently-viewed', [InteractionController::class, 'frequentlyViewed']);
    Route::get('/trending', [InteractionController::class, 'trending']);
    Route::get('/purchase-history', [InteractionController::class, 'purchaseHistory']);
    Route::get('/cart-analysis', [InteractionController::class, 'cartAnalysis']);
    Route::get('/wishlist', [InteractionController::class, 'wishlistItems']);
    Route::get('/abandoned-cart', [InteractionController::class, 'abandonedCart']);
    Route::get('/search-history', [InteractionController::class, 'searchHistory']);
    Route::get('/interests', [InteractionController::class, 'interests']);
    Route::get('/engagement-score', [InteractionController::class, 'engagementScore']);
    Route::get('/top-selling-products', [InteractionController::class, 'topSellingProducts']);
    Route::get('/new-arrivals', [InteractionController::class, 'newArrivals']);
    Route::get('/top-selling-categories', [InteractionController::class, 'topSellingCategories']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Interaction API Resource Routes <--- ADD THIS BLOCK
    Route::prefix('track')->group(function () {
        Route::post('/view', [InteractionController::class, 'view']);
        Route::post('/search', [InteractionController::class, 'search']);
        Route::post('/wishlist', [InteractionController::class, 'wishlist']);
        Route::post('/cart', [InteractionController::class, 'cart']);
        Route::post('/purchase', [InteractionController::class, 'purchase']);
        Route::post('/interaction', [InteractionController::class, 'interaction']);
        Route::post('/lifecycle', [InteractionController::class, 'lifecycle']);
    });

    // Review API Resource Routes
    Route::apiResource('/reviews', ReviewController::class);

    // Order API Routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/make-order', [OrderController::class, 'makeOrder']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::put('/{order}', [OrderController::class, 'update']);
        Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
        Route::delete('/{order}', [OrderController::class, 'destroy']);
    });
});