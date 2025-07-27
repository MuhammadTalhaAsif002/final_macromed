<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Interactions;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InteractionController extends Controller
{
    // Log a product view
    public function view(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'device_type' => 'nullable|string|max:50',
            'source_page' => 'nullable|string|max:255',
        ]);
        
        // Handle both authenticated and guest users
        $data['user_id'] = Auth::id() ?? 1; // Default to user 1 for guests
        $data['interaction_type'] = 'view';
        $data['timestamp'] = now();

        try {
            $interaction = Interactions::create($data);
            return response()->json($interaction, 201);
        } catch (\Exception $e) {
            Log::error('View tracking failed: ' . $e->getMessage());
            return response()->json(['message' => 'Tracking recorded'], 201);
        }
    }

    // Log a user search query
    public function search(Request $request)
    {
        $data = $request->validate([
            'search_query' => 'required|string|max:500',
            'device_type' => 'nullable|string|max:50',
            'source_page' => 'nullable|string|max:255',
        ]);
        // Handle both authenticated and guest users
        $data['user_id'] = Auth::id() ?? 1; // Default to user 1 for guests
        $data['interaction_type'] = 'search';
        $data['timestamp'] = now();
        $data['product_id'] = 1; // Dummy product_id for NOT NULL constraint

        $interaction = Interactions::create($data);
        return response()->json($interaction, 201);
    }

    // Add/remove product to wishlist
    public function wishlist(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'action' => 'required|in:add,remove',
        ]);
        
        // Handle both authenticated and guest users
        $data['user_id'] = Auth::id() ?? 1; // Default to user 1 for guests
        $data['interaction_type'] = 'wishlist';
        $data['timestamp'] = now();

        try {
            $interaction = Interactions::create($data);
            return response()->json($interaction, 201);
        } catch (\Exception $e) {
            Log::error('Wishlist tracking failed: ' . $e->getMessage());
            return response()->json(['message' => 'Tracking recorded'], 201);
        }
    }

    // Add/remove from cart
    public function cart(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'quantity' => 'nullable|integer',
            'action' => 'required|in:add,remove',
        ]);
        
        // Handle both authenticated and guest users
        $data['user_id'] = Auth::id() ?? 1; // Default to user 1 for guests
        $data['interaction_type'] = 'add_to_cart';
        $data['timestamp'] = now();

        try {
            $interaction = Interactions::create($data);
            return response()->json($interaction, 201);
        } catch (\Exception $e) {
            Log::error('Cart tracking failed: ' . $e->getMessage());
            return response()->json(['message' => 'Tracking recorded'], 201);
        }
    }

    // Record purchase event
    public function purchase(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
            'quantity' => 'required|integer',
        ]);
        // Handle both authenticated and guest users
        $data['user_id'] = Auth::id() ?? 1; // Default to user 1 for guests
        $data['interaction_type'] = 'purchase';
        $data['timestamp'] = now();

        $interaction = Interactions::create($data);
        return response()->json($interaction, 201);
    }

    // Log user interaction (clicks, hovers)
    public function interaction(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'nullable|integer|exists:products,product_id',
            'interaction_type' => 'required|string|max:50', // e.g., click, hover
            'device_type' => 'nullable|string|max:50',
            'source_page' => 'nullable|string|max:255',
        ]);
        $data['user_id'] = Auth::id();
        $data['timestamp'] = now();
        if (!isset($data['product_id'])) {
            $data['product_id'] = 1; // Dummy product_id for NOT NULL constraint
        }

        $interaction = Interactions::create($data);
        return response()->json($interaction, 201);
    }

    // Update user lifecycle stage
    public function lifecycle(Request $request)
    {
        $data = $request->validate([
            'lifecycle_stage' => 'required|string|max:255',
        ]);
        // You may want to update the user model or log this as an interaction
        // Example: log as interaction
        // Handle both authenticated and guest users
        $data['user_id'] = Auth::id() ?? 1; // Default to user 1 for guests
        $data['interaction_type'] = 'lifecycle';
        $data['timestamp'] = now();
        $data['product_id'] = 1; // Dummy product_id for NOT NULL constraint

        $interaction = Interactions::create($data);
        return response()->json($interaction, 201);
    }

    // ========== GET APIs FOR INSIGHTS AND ANALYTICS ==========

    /**
     * Get user activity analytics
     */
    public function analytics()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests
        $thirtyDaysAgo = now()->subDays(30);

        $analytics = [
            'total_interactions' => Interactions::where('user_id', $userId)->count(),
            'recent_interactions' => Interactions::where('user_id', $userId)
                ->where('timestamp', '>=', $thirtyDaysAgo)->count(),
            'interaction_types' => Interactions::where('user_id', $userId)
                ->select('interaction_type', DB::raw('count(*) as count'))
                ->groupBy('interaction_type')
                ->get(),
            'device_usage' => Interactions::where('user_id', $userId)
                ->whereNotNull('device_type')
                ->select('device_type', DB::raw('count(*) as count'))
                ->groupBy('device_type')
                ->get(),
            'most_active_days' => Interactions::where('user_id', $userId)
                ->where('timestamp', '>=', $thirtyDaysAgo)
                ->select(DB::raw('DATE(timestamp) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('count', 'desc')
                ->limit(7)
                ->get(),
        ];

        return response()->json($analytics);
    }

    /**
     * Get recent user interactions
     */
    public function recent()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests
        $recent = Interactions::where('user_id', $userId)
            ->with(['product'])
            ->orderBy('timestamp', 'desc')
            ->limit(20)
            ->get();

        return response()->json($recent);
    }

    /**
     * Get personalized product recommendations
     */
    public function recommendations(Request $request)
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests
        
        // Check if a specific product_id is provided for Python API recommendations
        if ($request->has('product_id')) {
            $request->validate([
                'product_id' => 'required|integer|exists:products,product_id',
                'type' => 'nullable|in:content,price,hybrid'
            ]);
            
            $type = $request->get('type', 'hybrid');
            
            try {
                // Try to get recommendations from Python API
                $pythonApiUrl = 'http://localhost:5000';
                $response = Http::timeout(10)->get($pythonApiUrl . '/api/recommend', [
                    'product_id' => $request->product_id,
                    'type' => $type === 'hybrid' ? 'content' : $type
                ]);

                if ($response->successful()) {
                    $recommendations = $response->json();
                    
                    // If hybrid, also get price-based recommendations
                    if ($type === 'hybrid') {
                        $priceResponse = Http::timeout(10)->get($pythonApiUrl . '/api/recommend', [
                            'product_id' => $request->product_id,
                            'type' => 'price'
                        ]);
                        
                        if ($priceResponse->successful()) {
                            $priceRecs = $priceResponse->json();
                            $recommendations = array_merge(
                                array_slice($recommendations, 0, 3),
                                array_slice($priceRecs, 0, 2)
                            );
                            
                            // Remove duplicates
                            $uniqueRecommendations = [];
                            $seenIds = [];
                            foreach ($recommendations as $rec) {
                                if (!in_array($rec['product_id'], $seenIds)) {
                                    $uniqueRecommendations[] = $rec;
                                    $seenIds[] = $rec['product_id'];
                                }
                            }
                            $recommendations = array_slice($uniqueRecommendations, 0, 5);
                        }
                    }
                    
                    return response()->json([
                        'recommendations' => $recommendations,
                        'reason' => "AI-powered recommendations based on product similarity",
                        'source' => 'python-api',
                        'type' => $type
                    ]);
                }
            } catch (\Exception $e) {
                // Fall back to Laravel-based recommendations if Python API fails
                Log::warning('Python API unavailable, falling back to Laravel recommendations', [
                    'error' => $e->getMessage(),
                    'product_id' => $request->product_id
                ]);
            }
        }
        
        // Fallback to original Laravel-based recommendations
        $userProductIds = Interactions::where('user_id', $userId)
            ->whereIn('interaction_type', ['view', 'purchase'])
            ->pluck('product_id')
            ->unique();

        if ($userProductIds->isEmpty()) {
            // If no interactions, return popular products
            $recommendations = Product::orderBy('average_rating', 'desc')
                ->limit(10)
                ->get();
        } else {
            // Get products in same categories as user's interactions
            $userCategories = Product::whereIn('product_id', $userProductIds)
                ->pluck('category')
                ->unique();

            $recommendations = Product::whereIn('category', $userCategories)
                ->whereNotIn('product_id', $userProductIds)
                ->orderBy('average_rating', 'desc')
                ->limit(10)
                ->get();

            // If not enough recommendations, add popular products
            if ($recommendations->count() < 10) {
                $additionalProducts = Product::whereNotIn('product_id', $userProductIds)
                    ->orderBy('average_rating', 'desc')
                    ->limit(10 - $recommendations->count())
                    ->get();
                $recommendations = $recommendations->merge($additionalProducts);
            }
        }

        return response()->json([
            'recommendations' => $recommendations,
            'reason' => 'Based on your viewing and purchase history',
            'source' => 'laravel'
        ]);
    }

    /**
     * Get "You also viewed" products
     */
    public function youAlsoViewed(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,product_id'
        ]);

        $productId = $request->product_id;
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests

        // Find users who viewed the same product
        $similarUsers = Interactions::where('product_id', $productId)
            ->where('interaction_type', 'view')
            ->where('user_id', '!=', $userId)
            ->pluck('user_id')
            ->unique();

        if ($similarUsers->isEmpty()) {
            return response()->json(['products' => [], 'message' => 'No similar viewing patterns found']);
        }

        // Get products viewed by similar users
        $alsoViewed = Interactions::whereIn('user_id', $similarUsers)
            ->where('interaction_type', 'view')
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('count(*) as view_count'))
            ->groupBy('product_id')
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->get();

        $products = Product::whereIn('product_id', $alsoViewed->pluck('product_id'))
            ->get()
            ->map(function ($product) use ($alsoViewed) {
                $viewCount = $alsoViewed->where('product_id', $product->product_id)->first()->view_count ?? 0;
                $product->view_count = $viewCount;
                return $product;
            })
            ->sortByDesc('view_count');

        return response()->json([
            'products' => $products,
            'reason' => 'Other users who viewed this product also viewed'
        ]);
    }

    /**
     * Get frequently viewed products by user
     */
    public function frequentlyViewed()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests

        $frequentlyViewed = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'view')
            ->select('product_id', DB::raw('count(*) as view_count'))
            ->groupBy('product_id')
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->get();

        $products = Product::whereIn('product_id', $frequentlyViewed->pluck('product_id'))
            ->get()
            ->map(function ($product) use ($frequentlyViewed) {
                $viewCount = $frequentlyViewed->where('product_id', $product->product_id)->first()->view_count ?? 0;
                $product->view_count = $viewCount;
                return $product;
            })
            ->sortByDesc('view_count');

        return response()->json([
            'products' => $products,
            'total_views' => $frequentlyViewed->sum('view_count')
        ]);
    }

    /**
     * Get trending products based on interactions
     */
    public function trending()
    {
        $thirtyDaysAgo = now()->subDays(30);

        $trending = Interactions::where('timestamp', '>=', $thirtyDaysAgo)
            ->whereIn('interaction_type', ['view', 'add_to_cart', 'purchase'])
            ->select('product_id', DB::raw('count(*) as interaction_count'))
            ->groupBy('product_id')
            ->orderBy('interaction_count', 'desc')
            ->limit(20)
            ->get();

        $products = Product::whereIn('product_id', $trending->pluck('product_id'))
            ->get()
            ->map(function ($product) use ($trending) {
                $interactionCount = $trending->where('product_id', $product->product_id)->first()->interaction_count ?? 0;
                $product->interaction_count = $interactionCount;
                return $product;
            })
            ->sortByDesc('interaction_count');

        return response()->json([
            'products' => $products,
            'period' => 'Last 30 days'
        ]);
    }

    /**
     * Get user's purchase history with insights
     */
    public function purchaseHistory()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests

        // Get purchase interactions
        $purchaseInteractions = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'purchase')
            ->with(['product'])
            ->orderBy('timestamp', 'desc')
            ->get();

        // Get actual orders
        $orders = Order::where('user_id', $userId)
            ->with(['product'])
            ->orderBy('order_date', 'desc')
            ->get();

        // Calculate insights
        $totalPurchases = $purchaseInteractions->count();
        $totalSpent = $orders->sum('total_amount');
        $averageOrderValue = $totalPurchases > 0 ? $totalSpent / $totalPurchases : 0;

        $categoryPreferences = $orders->groupBy('product.category')
            ->map(function ($categoryOrders) {
                return [
                    'category' => $categoryOrders->first()->product->category,
                    'count' => $categoryOrders->count(),
                    'total_spent' => $categoryOrders->sum('total_amount')
                ];
            })
            ->sortByDesc('total_spent');

        $monthlyTrends = $orders->groupBy(function ($order) {
            return $order->order_date->format('Y-m');
        })->map(function ($monthOrders) {
            return [
                'month' => $monthOrders->first()->order_date->format('Y-m'),
                'orders' => $monthOrders->count(),
                'total_spent' => $monthOrders->sum('total_amount')
            ];
        });

        return response()->json([
            'purchase_interactions' => $purchaseInteractions,
            'orders' => $orders,
            'insights' => [
                'total_purchases' => $totalPurchases,
                'total_spent' => $totalSpent,
                'average_order_value' => round($averageOrderValue, 2),
                'category_preferences' => $categoryPreferences,
                'monthly_trends' => $monthlyTrends
            ]
        ]);
    }

    /**
     * Get cart behavior analysis
     */
    public function cartAnalysis()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests

        $cartInteractions = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'add_to_cart')
            ->with(['product'])
            ->orderBy('timestamp', 'desc')
            ->get();

        $cartItems = $cartInteractions->groupBy('product_id')
            ->map(function ($interactions) {
                $product = $interactions->first()->product;
                $addCount = $interactions->where('action', 'add')->count();
                $removeCount = $interactions->where('action', 'remove')->count();
                
                return [
                    'product' => $product,
                    'add_count' => $addCount,
                    'remove_count' => $removeCount,
                    'net_adds' => $addCount - $removeCount,
                    'last_interaction' => $interactions->first()->timestamp
                ];
            })
            ->where('net_adds', '>', 0)
            ->sortByDesc('last_interaction');

        $totalCartValue = $cartItems->sum(function ($item) {
            return $item['product']->price * $item['net_adds'];
        });

        return response()->json([
            'cart_items' => $cartItems,
            'total_items' => $cartItems->count(),
            'total_value' => $totalCartValue,
            'analysis' => [
                'most_added_product' => $cartItems->sortByDesc('add_count')->first(),
                'recent_additions' => $cartItems->take(5)
            ]
        ]);
    }

    /**
     * Get user's wishlist
     */
    public function wishlistItems()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests

        $wishlistInteractions = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'wishlist')
            ->with(['product'])
            ->orderBy('timestamp', 'desc')
            ->get();

        $wishlistItems = $wishlistInteractions->groupBy('product_id')
            ->map(function ($interactions) {
                $product = $interactions->first()->product;
                $addCount = $interactions->where('action', 'add')->count();
                $removeCount = $interactions->where('action', 'remove')->count();
                
                return [
                    'product' => $product,
                    'added_count' => $addCount,
                    'removed_count' => $removeCount,
                    'is_in_wishlist' => $addCount > $removeCount,
                    'last_action' => $interactions->first()->action,
                    'last_updated' => $interactions->first()->timestamp
                ];
            })
            ->where('is_in_wishlist', true)
            ->sortByDesc('last_updated');

        return response()->json([
            'wishlist_items' => $wishlistItems,
            'total_items' => $wishlistItems->count()
        ]);
    }

    /**
     * Get abandoned cart items
     */
    public function abandonedCart()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests
        $thirtyDaysAgo = now()->subDays(30);

        // Get products added to cart but not purchased
        $cartProducts = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'add_to_cart')
            ->where('action', 'add')
            ->where('timestamp', '>=', $thirtyDaysAgo)
            ->pluck('product_id')
            ->unique();

        $purchasedProducts = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'purchase')
            ->where('timestamp', '>=', $thirtyDaysAgo)
            ->pluck('product_id')
            ->unique();

        $abandonedProductIds = $cartProducts->diff($purchasedProducts);

        $abandonedItems = Product::whereIn('product_id', $abandonedProductIds)
            ->get()
            ->map(function ($product) use ($userId) {
                $lastCartInteraction = Interactions::where('user_id', $userId)
                    ->where('product_id', $product->product_id)
                    ->where('interaction_type', 'add_to_cart')
                    ->where('action', 'add')
                    ->latest()
                    ->first();

                $product->abandoned_date = $lastCartInteraction->timestamp;
                $product->days_since_abandoned = now()->diffInDays($lastCartInteraction->timestamp);
                
                return $product;
            })
            ->sortByDesc('abandoned_date');

        return response()->json([
            'abandoned_items' => $abandonedItems,
            'total_abandoned' => $abandonedItems->count(),
            'period' => 'Last 30 days'
        ]);
    }

    /**
     * Get user's search history
     */
    public function searchHistory()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests

        $searchHistory = Interactions::where('user_id', $userId)
            ->where('interaction_type', 'search')
            ->whereNotNull('search_query')
            ->select('search_query', 'timestamp', 'device_type', 'source_page')
            ->orderBy('timestamp', 'desc')
            ->get();

        $popularSearches = $searchHistory->groupBy('search_query')
            ->map(function ($searches) {
                return [
                    'query' => $searches->first()->search_query,
                    'count' => $searches->count(),
                    'last_searched' => $searches->first()->timestamp
                ];
            })
            ->sortByDesc('count');

        return response()->json([
            'search_history' => $searchHistory,
            'popular_searches' => $popularSearches,
            'total_searches' => $searchHistory->count()
        ]);
    }

    /**
     * Get user interest analysis
     */
    public function interests()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests
        $ninetyDaysAgo = now()->subDays(90);

        // Get user's interactions with products
        $userInteractions = Interactions::where('user_id', $userId)
            ->where('timestamp', '>=', $ninetyDaysAgo)
            ->whereIn('interaction_type', ['view', 'add_to_cart', 'purchase', 'wishlist'])
            ->with(['product'])
            ->get();

        // Analyze category preferences
        $categoryInteractions = $userInteractions->groupBy('product.category')
            ->map(function ($interactions) {
                $category = $interactions->first()->product->category;
                $views = $interactions->where('interaction_type', 'view')->count();
                $cartAdds = $interactions->where('interaction_type', 'add_to_cart')->where('action', 'add')->count();
                $purchases = $interactions->where('interaction_type', 'purchase')->count();
                $wishlistAdds = $interactions->where('interaction_type', 'wishlist')->where('action', 'add')->count();

                return [
                    'category' => $category,
                    'views' => $views,
                    'cart_adds' => $cartAdds,
                    'purchases' => $purchases,
                    'wishlist_adds' => $wishlistAdds,
                    'total_interactions' => $interactions->count(),
                    'engagement_score' => ($views * 1) + ($cartAdds * 3) + ($purchases * 5) + ($wishlistAdds * 2)
                ];
            })
            ->sortByDesc('engagement_score');

        // Analyze brand preferences
        $brandInteractions = $userInteractions->groupBy('product.brand')
            ->map(function ($interactions) {
                $brand = $interactions->first()->product->brand;
                $purchases = $interactions->where('interaction_type', 'purchase')->count();
                
                return [
                    'brand' => $brand,
                    'interactions' => $interactions->count(),
                    'purchases' => $purchases,
                    'preference_score' => $purchases > 0 ? $interactions->count() / $purchases : 0
                ];
            })
            ->where('brand', '!=', null)
            ->sortByDesc('preference_score');

        // Price sensitivity analysis
        $viewedPrices = $userInteractions->where('interaction_type', 'view')
            ->pluck('product.price');
        
        $purchasedPrices = $userInteractions->where('interaction_type', 'purchase')
            ->pluck('product.price');

        $priceAnalysis = [
            'average_viewed_price' => $viewedPrices->avg(),
            'average_purchased_price' => $purchasedPrices->avg(),
            'price_range_viewed' => [
                'min' => $viewedPrices->min(),
                'max' => $viewedPrices->max()
            ],
            'price_range_purchased' => [
                'min' => $purchasedPrices->min(),
                'max' => $purchasedPrices->max()
            ]
        ];

        return response()->json([
            'category_preferences' => $categoryInteractions,
            'brand_preferences' => $brandInteractions,
            'price_analysis' => $priceAnalysis,
            'top_interests' => $categoryInteractions->take(5),
            'analysis_period' => 'Last 90 days'
        ]);
    }

    /**
     * Get user engagement score
     */
    public function engagementScore()
    {
        // Handle both authenticated and guest users
        $userId = Auth::id() ?? 1; // Default to user 1 for guests
        $thirtyDaysAgo = now()->subDays(30);
        $ninetyDaysAgo = now()->subDays(90);

        // Calculate recent engagement (last 30 days)
        $recentInteractions = Interactions::where('user_id', $userId)
            ->where('timestamp', '>=', $thirtyDaysAgo)
            ->get();

        $recentScore = $this->calculateEngagementScore($recentInteractions);

        // Calculate historical engagement (last 90 days)
        $historicalInteractions = Interactions::where('user_id', $userId)
            ->where('timestamp', '>=', $ninetyDaysAgo)
            ->get();

        $historicalScore = $this->calculateEngagementScore($historicalInteractions);

        // Determine engagement level
        $engagementLevel = $this->getEngagementLevel($recentScore);

        return response()->json([
            'recent_score' => $recentScore,
            'historical_score' => $historicalScore,
            'engagement_level' => $engagementLevel,
            'recent_interactions' => $recentInteractions->count(),
            'historical_interactions' => $historicalInteractions->count(),
            'periods' => [
                'recent' => 'Last 30 days',
                'historical' => 'Last 90 days'
            ]
        ]);
    }

    /**
     * Helper method to calculate engagement score
     */
    private function calculateEngagementScore($interactions)
    {
        $score = 0;
        
        foreach ($interactions as $interaction) {
            switch ($interaction->interaction_type) {
                case 'view':
                    $score += 1;
                    break;
                case 'search':
                    $score += 2;
                    break;
                case 'wishlist':
                    $score += 3;
                    break;
                case 'add_to_cart':
                    $score += 4;
                    break;
                case 'purchase':
                    $score += 10;
                    break;
            }
        }

        return $score;
    }

    /**
     * Helper method to determine engagement level
     */
    private function getEngagementLevel($score)
    {
        if ($score >= 50) return 'Very High';
        if ($score >= 30) return 'High';
        if ($score >= 15) return 'Medium';
        if ($score >= 5) return 'Low';
        return 'Very Low';
    }

    /**
     * Get top selling products (by purchase count)
     */
    public function topSellingProducts()
    {
        $topProducts = \App\Models\Product::withCount([
            'interactions as purchase_count' => function ($query) {
                $query->where('interaction_type', 'purchase');
            }
        ])
        ->orderByDesc('purchase_count')
        ->get();

        return response()->json(['top_selling_products' => $topProducts]);
    }

    /**
     * Get new arrivals (latest added products)
     */
    public function newArrivals()
    {
        $newArrivals = \App\Models\Product::orderBy('created_at', 'desc')
            ->get();
        return response()->json(['new_arrivals' => $newArrivals]);
    }

    /**
     * Get top selling categories (by purchase count)
     */
    public function topSellingCategories()
    {
        $topCategories = \App\Models\Interactions::where('interaction_type', 'purchase')
            ->join('products', 'interactions.product_id', '=', 'products.product_id')
            ->select('products.category', \DB::raw('COUNT(*) as purchase_count'))
            ->groupBy('products.category')
            ->orderByDesc('purchase_count')
            ->get();

        return response()->json(['top_selling_categories' => $topCategories]);
    }
}