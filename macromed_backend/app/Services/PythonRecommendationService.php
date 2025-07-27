<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PythonRecommendationService
{
    private $baseUrl;
    private $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.python_api.url', 'http://localhost:5001');
        $this->timeout = config('services.python_api.timeout', 10);
    }

    /**
     * Get recommendations from Python API
     */
    public function getRecommendations(int $productId, string $type = 'content'): array
    {
        $cacheKey = "python_recommendations_{$productId}_{$type}";
        
        // Try to get from cache first
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::timeout($this->timeout)->get($this->baseUrl . '/api/recommend', [
                'product_id' => $productId,
                'type' => $type
            ]);

            if ($response->successful()) {
                $recommendations = $response->json();
                
                // Cache the results for 30 minutes
                Cache::put($cacheKey, $recommendations, 1800);
                
                return $recommendations;
            } else {
                Log::error('Python API recommendation failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'product_id' => $productId,
                    'type' => $type
                ]);
                
                return [];
            }
        } catch (\Exception $e) {
            Log::error('Python API connection error', [
                'error' => $e->getMessage(),
                'product_id' => $productId,
                'type' => $type
            ]);
            
            return [];
        }
    }

    /**
     * Get hybrid recommendations (content + price-based)
     */
    public function getHybridRecommendations(int $productId): array
    {
        $contentRecs = $this->getRecommendations($productId, 'content');
        $priceRecs = $this->getRecommendations($productId, 'price');

        $recommendations = array_merge(
            array_slice($contentRecs, 0, 3),
            array_slice($priceRecs, 0, 2)
        );

        // Remove duplicates based on product_id
        $uniqueRecommendations = [];
        $seenIds = [];
        foreach ($recommendations as $rec) {
            if (!in_array($rec['product_id'], $seenIds)) {
                $uniqueRecommendations[] = $rec;
                $seenIds[] = $rec['product_id'];
            }
        }

        return array_slice($uniqueRecommendations, 0, 5);
    }

    /**
     * Check if Python API is healthy
     */
    public function isHealthy(): bool
    {
        try {
            $response = Http::timeout(5)->get($this->baseUrl . '/api/recommend', [
                'product_id' => 1,
                'type' => 'content'
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get API health status with details
     */
    public function getHealthStatus(): array
    {
        try {
            $startTime = microtime(true);
            $response = Http::timeout(5)->get($this->baseUrl . '/api/recommend', [
                'product_id' => 1,
                'type' => 'content'
            ]);
            $responseTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

            return [
                'status' => 'healthy',
                'python_api' => $response->successful() ? 'online' : 'error',
                'response_time_ms' => round($responseTime, 2),
                'status_code' => $response->status()
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'python_api' => 'offline',
                'error' => $e->getMessage(),
                'response_time_ms' => null
            ];
        }
    }

    /**
     * Clear recommendation cache for a product
     */
    public function clearCache(int $productId): void
    {
        Cache::forget("python_recommendations_{$productId}_content");
        Cache::forget("python_recommendations_{$productId}_price");
    }

    /**
     * Get recommendations with fallback to Laravel-based recommendations
     */
    public function getRecommendationsWithFallback(int $productId, string $type = 'hybrid', callable $fallbackCallback): array
    {
        $recommendations = [];
        
        if ($type === 'hybrid') {
            $recommendations = $this->getHybridRecommendations($productId);
        } else {
            $recommendations = $this->getRecommendations($productId, $type);
        }

        // If Python API returns no recommendations, use fallback
        if (empty($recommendations)) {
            Log::info('Python API returned no recommendations, using fallback', [
                'product_id' => $productId,
                'type' => $type
            ]);
            
            return $fallbackCallback();
        }

        return $recommendations;
    }
} 