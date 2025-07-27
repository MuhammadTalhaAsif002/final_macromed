<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash; // Add this line for hashing passwords
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Truncate handled by DatabaseSeeder

        for ($i = 0; $i < 10; $i++) { // Create 10 dummy users
            User::create([
                'email' => $faker->unique()->safeEmail(),
                'password' => Hash::make('password'), // Add a default hashed password
                'first_name' => $faker->firstName(),
                'last_name' => $faker->lastName(),
                'registration_date' => $faker->dateTimeThisYear(),
                'last_login_date' => $faker->dateTimeThisMonth(),
                'medical_specialty' => $faker->randomElement([
                    'Orthopedics', 'Cardiology', 'Pediatrics', 'General Surgery',
                    'Neurology', 'Dermatology', 'Oncology', 'Anesthesiology'
                ]),
                'practice_type' => $faker->randomElement([
                    'Hospital', 'Clinic', 'ASC', 'Private Practice'
                ]),
                'location' => $faker->city() . ', ' . $faker->stateAbbr(),
                'organization_name' => $faker->company(),
                'user_segment' => $faker->randomElement([
                    'High Volume Buyer', 'New Customer', 'Specialty', 'General'
                ]),
                'preferred_brands' => $faker->optional(0.5)->words(3, true),
            ]);
        }
    }
}