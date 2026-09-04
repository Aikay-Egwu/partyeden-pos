<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with real shop data.
     */
    public function run(): void
    {
        // Seed database with real product catalog, categories, images, and users
        // from the transformed JSON files in storage/app/public/shop/
        $this->call([ShopDataSeeder::class, DeliveryZoneSeeder::class]);

    }
}
