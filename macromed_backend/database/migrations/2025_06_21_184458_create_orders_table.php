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
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id')->comment('Unique identifier for each order');
            $table->unsignedBigInteger('user_id')->nullable(false)->comment('Foreign key to the users table');
            $table->unsignedBigInteger('product_id')->nullable(false)->comment('Foreign key to the products table');
            $table->integer('quantity')->nullable(false)->comment('Quantity of the product ordered');
            $table->decimal('unit_price', 10, 2)->nullable(false)->comment('Price per unit at the time of order');
            $table->decimal('total_amount', 10, 2)->nullable(false)->comment('Total amount for this order item');
            $table->enum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending')->comment('Current status of the order');
            $table->string('order_number', 50)->unique()->comment('Unique order number for customer reference');
            $table->text('shipping_address')->nullable()->comment('Shipping address for the order');
            $table->string('billing_address')->nullable()->comment('Billing address for the order');
            $table->string('contact_phone', 20)->nullable()->comment('Contact phone number for shipping');
            $table->string('contact_email', 255)->nullable()->comment('Contact email for order updates');
            $table->text('special_instructions')->nullable()->comment('Special instructions for the order');
            $table->string('payment_method', 50)->nullable()->comment('Payment method used');
            $table->string('payment_status', 50)->default('pending')->comment('Payment status');
            $table->string('tracking_number', 100)->nullable()->comment('Shipping tracking number');
            $table->dateTime('estimated_delivery')->nullable()->comment('Estimated delivery date');
            $table->dateTime('order_date')->nullable(false)->comment('Date and time the order was placed');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
        DB::statement("ALTER TABLE orders COMMENT 'Table storing customer orders and order details'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
