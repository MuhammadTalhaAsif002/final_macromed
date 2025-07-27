<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PythonRecommendationService;
use Illuminate\Support\Facades\Log;

class RecommendationController extends Controller
{
    private $pythonService;

    public function __construct(PythonRecommendationService $pythonService)
    {
        $this->pythonService = $pythonService;
    }

    /**
     * Get content-based recommendations from Python API
     */
    public function contentBased(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
        ]);

        $recommendations = $this->pythonService->getRecommendations($request->product_id, 'content');

        if (empty($recommendations)) {
            return response()->json([
                'error' => 'No content-based recommendations available',
                'fallback' => true
            ], 404);
        }

        return response()->json([
            'recommendations' => $recommendations,
            'type' => 'content-based',
            'source' => 'python-api'
        ]);
    }

    /**
     * Get price-based recommendations from Python API
     */
    public function priceBased(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
        ]);

        $recommendations = $this->pythonService->getRecommendations($request->product_id, 'price');

        if (empty($recommendations)) {
            return response()->json([
                'error' => 'No price-based recommendations available',
                'fallback' => true
            ], 404);
        }

        return response()->json([
            'recommendations' => $recommendations,
            'type' => 'price-based',
            'source' => 'python-api'
        ]);
    }

    /**
     * Get hybrid recommendations (both content and price-based)
     */
    public function hybrid(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
        ]);

        $recommendations = $this->pythonService->getHybridRecommendations($request->product_id);

        if (empty($recommendations)) {
            return response()->json([
                'error' => 'No hybrid recommendations available',
                'fallback' => true
            ], 404);
        }

        return response()->json([
            'recommendations' => $recommendations,
            'type' => 'hybrid',
            'sources' => ['content-based', 'price-based'],
            'source' => 'python-api'
        ]);
    }

    /**
     * Check Python API health status
     */
    public function health()
    {
        $healthStatus = $this->pythonService->getHealthStatus();
        
        if ($healthStatus['status'] === 'healthy') {
            return response()->json($healthStatus);
        } else {
            return response()->json($healthStatus, 503);
        }
    }

    /**
     * Clear recommendation cache for a product
     */
    public function clearCache(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,product_id',
        ]);

        $this->pythonService->clearCache($request->product_id);

        return response()->json([
            'message' => 'Recommendation cache cleared successfully',
            'product_id' => $request->product_id
        ]);
    }
} 