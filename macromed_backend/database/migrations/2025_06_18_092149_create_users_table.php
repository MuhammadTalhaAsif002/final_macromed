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
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id')->comment('Unique identifier for each user');
            $table->string('email')->unique()->nullable(false)->comment('User email address (unique login identifier)');
            $table->string('first_name', 100)->nullable()->comment('User\'s first name');
            $table->string('last_name', 100)->nullable()->comment('User\'s last name');
            // Password column will be added by a separate migration for better practice
            $table->dateTime('registration_date')->nullable()->comment('Date and time of user registration');
            $table->dateTime('last_login_date')->nullable()->comment('Date and time of user\'s last login');
            $table->string('medical_specialty', 255)->nullable()->comment('User\'s medical specialty (e.g., Orthopedics, Cardiology)');
            $table->string('practice_type', 100)->nullable()->comment('Type of medical practice (e.g., Hospital, Clinic, ASC)');
            $table->string('location', 255)->nullable()->comment('User\'s city, state, or country');
            $table->string('organization_name', 255)->nullable()->comment('Name of the organization the user belongs to');
            $table->string('user_segment', 100)->nullable()->comment('User segmentation for marketing or personalization');
            $table->string('preferred_brands', 255)->nullable()->comment('Comma-separated list of preferred brands if specified by user');
            $table->string('user_type', 50)->default('clinics')->nullable(false)->comment('Type of user: clinics, general hospitals, specialized hospitals, surgeons, procurement officers');
            $table->timestamps(); // crucial for created_at and updated_at
        });
        DB::statement("ALTER TABLE users COMMENT 'Table storing user profile data'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};