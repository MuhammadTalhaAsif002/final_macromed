<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders for the authenticated user.
     */
    public function index()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($orders);
    }

    /**
     * Store a newly created order (makeOrder API).
     */
    public function makeOrder(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate the request
            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,product_id',
                'quantity' => 'required|integer|min:1',
                'shipping_address' => 'required|string',
                'billing_address' => 'nullable|string',
                'contact_phone' => 'required|string|max:20',
                'contact_email' => 'required|email|max:255',
                'special_instructions' => 'nullable|string',
                'payment_method' => 'nullable|string|max:50',
            ]);

            // Get the product to check stock and get price
            $product = Product::findOrFail($validated['product_id']);

            // Check if product is in stock
            if ($product->stock_quantity < $validated['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Insufficient stock. Available: ' . $product->stock_quantity
                ]);
            }

            // Calculate total amount
            $unitPrice = $product->price;
            $totalAmount = $validated['quantity'] * $unitPrice;

            // Create the order
            $order = Order::create([
                'user_id' => Auth::id(),
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'unit_price' => $unitPrice,
                'total_amount' => $totalAmount,
                'order_status' => 'pending',
                'order_number' => Order::generateOrderNumber(),
                'shipping_address' => $validated['shipping_address'],
                'billing_address' => $validated['billing_address'] ?? $validated['shipping_address'],
                'contact_phone' => $validated['contact_phone'],
                'contact_email' => $validated['contact_email'],
                'special_instructions' => $validated['special_instructions'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'order_date' => now(),
            ]);

            // Update product stock
            $product->decrement('stock_quantity', $validated['quantity']);

            // Load relationships for response
            $order->load(['product', 'user']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'order' => $order,
                    'order_summary' => [
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'estimated_delivery' => now()->addDays(7)->format('Y-m-d H:i:s'),
                    ]
                ]
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        // Ensure user can only view their own orders
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->load(['product', 'user']);
        return response()->json($order);
    }

    /**
     * Update the specified order in storage.
     */
    public function update(Request $request, Order $order)
    {
        // Ensure user can only update their own orders
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'shipping_address' => 'sometimes|required|string',
            'billing_address' => 'nullable|string',
            'contact_phone' => 'sometimes|required|string|max:20',
            'contact_email' => 'sometimes|required|email|max:255',
            'special_instructions' => 'nullable|string',
        ]);

        $order->update($validated);
        $order->load(['product', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order
        ]);
    }

    /**
     * Cancel the specified order.
     */
    public function cancel(Order $order)
    {
        // Ensure user can only cancel their own orders
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow cancellation of pending orders
        if ($order->order_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled. Current status: ' . $order->order_status
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update order status
            $order->update(['order_status' => 'cancelled']);

            // Restore product stock
            $product = Product::find($order->product_id);
            $product->increment('stock_quantity', $order->quantity);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Order $order)
    {
        // Ensure user can only delete their own orders
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order->delete();
        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
}
