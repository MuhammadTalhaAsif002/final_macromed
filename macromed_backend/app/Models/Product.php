<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'product_name',
        'description',
        'category',
        'subcategory',
        'price',
        'brand',
        'manufacturer',
        'material',
        'intended_use',
        'dimensions',
        'sterility',
        'reusable_disposable',
        'stock_quantity',
        'average_rating',
        'total_reviews',
        'image_url',
        'product_url',
    ];

    protected $casts = [
        'dimensions' => 'array',
        'price' => 'float',
        'average_rating' => 'float',
    ];

    public function interactions()
    {
        return $this->hasMany(Interactions::class, 'product_id', 'product_id');
    }
}