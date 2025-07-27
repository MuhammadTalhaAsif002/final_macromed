<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;

class OrderSeeder extends Seeder
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
            $this->command->warn('Cannot seed orders: No users or products found. Please seed users and products first.');
            return;
        }

        $orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        $paymentMethods = ['credit_card', 'bank_transfer', 'paypal', 'cash_on_delivery'];

        for ($i = 0; $i < 20; $i++) { // Create 20 sample orders
            $product = Product::find($faker->randomElement($productIds));
            $quantity = $faker->numberBetween(1, 5);
            $unitPrice = $product->price;
            $totalAmount = $quantity * $unitPrice;

            DB::table('orders')->insert([
                'user_id' => $faker->randomElement($userIds),
                'product_id' => $product->product_id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_amount' => $totalAmount,
                'order_status' => $faker->randomElement($orderStatuses),
                'order_number' => Order::generateOrderNumber(),
                'shipping_address' => $faker->address(),
                'billing_address' => $faker->address(),
                'contact_phone' => $faker->phoneNumber(),
                'contact_email' => $faker->email(),
                'special_instructions' => $faker->optional(0.3)->sentence(),
                'payment_method' => $faker->randomElement($paymentMethods),
                'payment_status' => $faker->randomElement(['pending', 'paid', 'failed']),
                'tracking_number' => $faker->optional(0.7)->bothify('TRK-########'),
                'estimated_delivery' => $faker->optional(0.8)->dateTimeBetween('now', '+2 weeks'),
                'order_date' => $faker->dateTimeThisYear(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Orders seeded successfully!');
    }
}
