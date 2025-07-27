<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'order_id';

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_amount',
        'order_status',
        'order_number',
        'shipping_address',
        'billing_address',
        'contact_phone',
        'contact_email',
        'special_instructions',
        'payment_method',
        'payment_status',
        'tracking_number',
        'estimated_delivery',
        'order_date',
    ];

    protected $casts = [
        'unit_price' => 'float',
        'total_amount' => 'float',
        'order_date' => 'datetime',
        'estimated_delivery' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Generate unique order number
    public static function generateOrderNumber()
    {
        $prefix = 'ORD';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -6));
        return $prefix . $date . $random;
    }

    // Calculate total amount
    public function calculateTotal()
    {
        return $this->quantity * $this->unit_price;
    }
}
