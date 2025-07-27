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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id('review_id')->comment('Unique identifier for each review');
            $table->unsignedBigInteger('product_id')->nullable(false)->comment('Foreign key to the products table');
            $table->unsignedBigInteger('user_id')->nullable(false)->comment('Foreign key to the users table');
            $table->integer('rating')->nullable(false)->comment('Rating given by the user (e.g., 1 to 5 stars)');
            $table->text('review_text')->nullable()->comment('Detailed text of the review');
            $table->dateTime('timestamp')->nullable(false)->comment('Date and time the review was submitted');
            $table->boolean('is_verified_buyer')->default(false)->comment('Indicates if the reviewer is a verified buyer of the product');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
        DB::statement("ALTER TABLE reviews COMMENT 'Table storing product reviews and ratings'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};