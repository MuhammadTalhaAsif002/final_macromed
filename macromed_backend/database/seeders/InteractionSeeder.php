<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\User;
use App\Models\Product;

class InteractionSeeder extends Seeder
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
            $this->command->warn('Cannot seed interactions: No users or products found. Please seed users and products first.');
            return;
        }

        $interactionTypes = ['view', 'add_to_cart', 'purchase', 'wishlist', 'search', 'compare'];
        $deviceTypes = ['desktop', 'mobile', 'tablet'];
        $sourcePages = ['homepage', 'search_results', 'product_page', 'category_page', 'wishlist'];

        for ($i = 0; $i < 50; $i++) { // Create 50 interactions
            $interactionType = $faker->randomElement($interactionTypes);
            $searchQuery = null;
            $quantity = 1;

            if ($interactionType === 'search') {
                $searchQuery = $faker->word() . ' ' . $faker->word();
            } elseif ($interactionType === 'add_to_cart' || $interactionType === 'purchase') {
                $quantity = $faker->numberBetween(1, 5);
            }

            DB::table('interactions')->insert([
                'user_id' => $faker->randomElement($userIds),
                'product_id' => $faker->randomElement($productIds),
                'interaction_type' => $interactionType,
                'timestamp' => $faker->dateTimeThisYear(),
                'quantity' => $quantity,
                'session_id' => $faker->uuid(),
                'device_type' => $faker->randomElement($deviceTypes),
                'source_page' => $faker->randomElement($sourcePages),
                'search_query' => $searchQuery,
                'created_at' => now(), // Add timestamps here too
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Interactions seeded successfully!');
    }
}