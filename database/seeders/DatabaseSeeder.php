<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

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
        $this->call([
            // $this->user()
            UserSeeder::class,

            // ShopDataSeeder::class,
            // DeliveryZoneSeeder::class,
            // FaqSeeder::class,
        ]);

    }

    protected function user(): void
    {
        $first_user = new User;
        $first_user->name = 'Ikenna Egwu';
        $first_user->email = 'justaikay@gmail.com';
        $first_user->email_verified_at = Carbon::now();
        $first_user->password = Hash::make('SecretPassword');
        $first_user->save();
    }
}
