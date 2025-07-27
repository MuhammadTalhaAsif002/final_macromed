<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add the password column after 'email'
            $table->string('password')->after('email'); // password is now required
            $table->string('user_type', 50)->after('password')->default('clinics')->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the password column if rolling back the migration
            $table->dropColumn('password');
            $table->dropColumn('user_type');
        });
    }
};