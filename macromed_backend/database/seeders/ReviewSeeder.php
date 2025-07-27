<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\User;
use App\Models\Product;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Truncate handled by DatabaseSeeder

        $userIds = User::pluck('user_id')->toArray();
        $productIds = Product::pluck('product_id')->toArray();

        if (empty($userIds) || empty($productIds)) {
            $this->command->warn('Cannot seed reviews: No users or products found. Please seed users and products first.');
            return;
        }

        for ($i = 0; $i < 30; $i++) { // Create 30 reviews
            DB::table('reviews')->insert([
                'product_id' => $faker->randomElement($productIds),
                'user_id' => $faker->randomElement($userIds),
                'rating' => $faker->numberBetween(1, 5),
                'review_text' => $faker->paragraph(rand(2, 5)),
                'timestamp' => $faker->dateTimeThisYear(),
                'is_verified_buyer' => $faker->boolean(80),
                'created_at' => now(), // Add timestamps here too
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Reviews seeded successfully!');
    }
}