<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Make sure DB facade is imported

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // PostgreSQL-compatible foreign key handling
        DB::statement('SET session_replication_role = replica;');

        // TRUNCATE tables in reverse dependency order
        // (i.e., child tables before parent tables)
        DB::table('orders')->truncate();       // Depends on products, users
        DB::table('reviews')->truncate();      // Depends on products, users
        DB::table('interactions')->truncate(); // Depends on products, users
        DB::table('products')->truncate();     // Parent table
        DB::table('users')->truncate();        // Parent table

        // Re-enable foreign key checks
        DB::statement('SET session_replication_role = DEFAULT;');

        // Call your specific seeders in the correct dependency order
        // Users and Products must be seeded BEFORE Interactions, Reviews, and Orders
        $this->call(UserSeeder::class);
        $this->call(ProductSeeder::class);
        $this->call(InteractionSeeder::class);
        $this->call(ReviewSeeder::class);
        $this->call(OrderSeeder::class);
    }
}