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
        Schema::create('interactions', function (Blueprint $table) {
            $table->id('interaction_id')->comment('Unique identifier for each interaction');
            $table->unsignedBigInteger('user_id')->nullable(false)->comment('Foreign key to the users table');
            $table->unsignedBigInteger('product_id')->nullable(false)->comment('Foreign key to the products table');
            $table->enum('interaction_type', ['view', 'add_to_cart', 'purchase', 'wishlist', 'search', 'compare'])->nullable(false)->comment('Type of interaction (e.g., view, add_to_cart, purchase)');
            $table->dateTime('timestamp')->nullable(false)->comment('Date and time of the interaction');
            $table->integer('quantity')->nullable()->comment('Quantity of product involved in interaction (e.g., for add_to_cart, purchase)');
            $table->string('session_id', 255)->nullable()->comment('User session identifier');
            $table->string('device_type', 50)->nullable()->comment('Device used for interaction (e.g., desktop, mobile)');
            $table->string('source_page', 255)->nullable()->comment('Page from which the interaction occurred');
            $table->string('search_query', 500)->nullable()->comment('Search query if interaction_type is search');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
        DB::statement("ALTER TABLE interactions COMMENT 'Table logging user interactions with products'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
    }
};