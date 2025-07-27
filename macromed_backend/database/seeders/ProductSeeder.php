<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use SplFileObject;
use Exception;
use Faker\Factory as Faker;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate handled by DatabaseSeeder

        $csvFile = database_path('..') . '/cleaned_surgical_tools.csv';

        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at: {$csvFile}");
            return;
        }

        $faker = Faker::create();

        $subcategories = [
            'General Surgical Instruments', 'Orthopedic Instruments', 'Dental Tools',
            'Cardiovascular Devices', 'Neurosurgical Instruments', 'Ophthalmic Tools',
            'Sterilization Equipment', 'Diagnostic Tools', 'Suture Instruments'
        ];
        $brands = [
            'Meditek', 'SurgiCare', 'PrecisionMed', 'OrthoLink', 'BioMatrix', 'ApexSurg'
        ];
        $manufacturers = [
            'Global Medical Corp', 'Innovate Healthcare', 'Elite Surgical Solutions',
            'Advanced Instruments Inc.', 'Pinnacle MedTech'
        ];
        $materials = [
            'Medical Grade Stainless Steel', 'Titanium Alloy', 'High-Grade Polymer',
            'Ceramic', 'Tungsten Carbide', 'Aluminum Alloy'
        ];
        $intended_uses = [
            'General Surgery', 'Orthopedic Surgery', 'Cardiovascular Procedures',
            'Neuro-Spinal Surgery', 'Dental Procedures', 'Eye Surgery', 'Urology'
        ];
        $reusable_disposable_options = ['Reusable', 'Single-Use'];
        $sterility_options = ['Sterile', 'Non-Sterile'];
        $placeholder_image_url = 'https://via.placeholder.com/150/0000FF/FFFFFF?text=No+Image';

        try {
            $file = new SplFileObject($csvFile);
            $file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY | SplFileObject::READ_AHEAD);

            $header = null;
            $products = [];
            $batchSize = 500;

            foreach ($file as $row) {
                if ($header === null) {
                    $header = array_map('trim', $row);
                    continue;
                }

                if (empty(array_filter($row))) {
                    continue;
                }

                if (count($row) !== count($header)) {
                    $this->command->warn("Skipping malformed row: " . implode(',', $row));
                    continue;
                }

                $data = array_combine($header, array_map('trim', $row));

                $price = (float) str_replace(['$', ','], '', $data['Price']);
                if (!is_numeric($price)) {
                    $price = 0.00;
                }

                // Generate a two-line description
                $descriptionLine1 = $faker->sentence(rand(6, 10));
                $descriptionLine2 = "This {$data['Title']} is an essential tool for {$data['Category']} procedures.";
                $fullDescription = $descriptionLine1 . "\n" . $descriptionLine2;

                $productData = [
                    'product_name'      => $data['Title'],
                    'description'       => $fullDescription, // Generated two-line description
                    'category'          => $data['Category'],
                    'subcategory'       => $faker->randomElement($subcategories),
                    'price'             => $price,
                    'brand'             => $faker->randomElement($brands),
                    'manufacturer'      => $faker->randomElement($manufacturers),
                    'material'          => $faker->randomElement($materials),
                    'intended_use'      => $faker->randomElement($intended_uses),
                    'dimensions'        => json_encode(['text' => $data['Dimensions']]),
                    'sterility'         => $faker->randomElement($sterility_options),
                    'reusable_disposable' => $faker->randomElement($reusable_disposable_options),
                    'stock_quantity'    => $faker->numberBetween(0, 500),
                    'average_rating'    => $faker->randomFloat(2, 1, 5),
                    'total_reviews'     => $faker->numberBetween(0, 100),
                    'image_url'         => empty($data['Image']) ? $placeholder_image_url : $data['Image'],
                    'product_url'       => $data['Title_URL'],
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ];

                $products[] = $productData;

                if (count($products) >= $batchSize) {
                    DB::table('products')->insert($products);
                    $products = [];
                }
            }

            if (!empty($products)) {
                DB::table('products')->insert($products);
            }

            $this->command->info('Products seeded successfully from CSV!');

        } catch (Exception $e) {
            $this->command->error("Error seeding products: " . $e->getMessage());
        }
    }
}