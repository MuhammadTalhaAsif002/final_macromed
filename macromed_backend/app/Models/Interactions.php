<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interactions extends Model
{
    use HasFactory;

    protected $table = 'interactions';
    protected $primaryKey = 'interaction_id';

    protected $fillable = [
        'user_id',
        'product_id',
        'interaction_type',
        'timestamp',
        'quantity',
        'session_id',
        'device_type',
        'source_page',
        'search_query',
    ];

    public $timestamps = true;

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
