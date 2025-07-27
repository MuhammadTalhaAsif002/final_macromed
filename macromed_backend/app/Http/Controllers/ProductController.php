<?php

namespace App\Http\Controllers;

use App\Models\Product; // Make sure to import your Product Model
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; // Used for validation errors

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'price' => 'required|numeric',
            'brand' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'intended_use' => 'nullable|string|max:255',
            'dimensions' => 'nullable|array',
            'sterility' => 'nullable|string|max:255',
            'reusable_disposable' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer',
            'average_rating' => 'nullable|numeric',
            'total_reviews' => 'nullable|integer',
            'image_url' => 'nullable|url',
            'product_url' => 'nullable|url',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        return response()->json($product);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'price' => 'sometimes|required|numeric',
            'brand' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'intended_use' => 'nullable|string|max:255',
            'dimensions' => 'nullable|array',
            'sterility' => 'nullable|string|max:255',
            'reusable_disposable' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer',
            'average_rating' => 'nullable|numeric',
            'total_reviews' => 'nullable|integer',
            'image_url' => 'nullable|url',
            'product_url' => 'nullable|url',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Get all products by category from request body.
     * Example: { "category": "Surgical instruicvments" }
     */
    public function getByCategory(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
        ]);
        $products = Product::where('category', $validated['category'])->get();
        return response()->json($products);
    }

    /**
     * Search products by query across multiple columns (deep match)
     * Example: /api/products/search?query=forceps
     */
    public function searchProducts(Request $request)
    {
        $query = $request->input('query');
        if (!$query) {
            return response()->json([]);
        }

        $products = Product::where(function ($q) use ($query) {
            $q->where('product_name', 'like', "%$query%")
                ->orWhere('description', 'like', "%$query%")
                ->orWhere('category', 'like', "%$query%")
                ->orWhere('subcategory', 'like', "%$query%")
                ->orWhere('brand', 'like', "%$query%")
                ->orWhere('manufacturer', 'like', "%$query%")
                ->orWhere('material', 'like', "%$query%")
                ->orWhere('intended_use', 'like', "%$query%")
                ->orWhere('dimensions', 'like', "%$query%")
                ->orWhere('sterility', 'like', "%$query%")
                ->orWhere('reusable_disposable', 'like', "%$query%")
                ->orWhere('image_url', 'like', "%$query%")
                ->orWhere('product_url', 'like', "%$query%")
                ;
        })->get();

        return response()->json($products);
    }
}