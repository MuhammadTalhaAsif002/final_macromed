<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id')->comment('Unique identifier for each product');
            $table->string('product_name', 255)->nullable(false)->comment('Name of the product');
            $table->text('description')->nullable()->comment('Detailed description of the product');
            $table->string('category', 100)->nullable()->comment('Main category of the product (e.g., Surgical Instruments)');
            $table->string('subcategory', 100)->nullable()->comment('Subcategory of the product (e.g., Forceps, Scissors)');
            $table->decimal('price', 10, 2)->nullable(false)->comment('Price of the product');
            $table->string('brand', 100)->nullable()->comment('Brand name of the product');
            $table->string('manufacturer', 255)->nullable()->comment('Manufacturer of the product');
            $table->string('material', 255)->nullable()->comment('Primary material composition of the product');
            $table->string('intended_use', 255)->nullable()->comment('Intended medical use or application');
            $table->json('dimensions')->nullable()->comment('Dimensions of the product in JSON format (e.g., {"length": "150mm", "width": "50mm"})');
            $table->enum('sterility', ['Sterile', 'Non-Sterile'])->nullable()->comment('Sterility status of the product');
            $table->enum('reusable_disposable', ['Reusable', 'Single-Use'])->nullable()->comment('Indicates if the product is reusable or disposable');
            $table->integer('stock_quantity')->default(0)->comment('Current quantity of the product in stock');
            $table->decimal('average_rating', 3, 2)->default(0.00)->comment('Average customer rating of the product');
            $table->integer('total_reviews')->default(0)->comment('Total number of reviews received');
            $table->string('image_url', 2048)->nullable()->comment('URL to the product image');
            $table->string('product_url', 2048)->nullable()->comment('URL to the product page on the external website');
            $table->timestamps();
        });
        DB::statement("ALTER TABLE products COMMENT 'Table storing details about medical products and surgical instruments'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};