<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Product;
use App\Models\StockReservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockReservation>
 */
class StockReservationFactory extends Factory
{
    protected $model = StockReservation::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'variant_id' => null,
            'location_id' => Location::factory(),
            'quantity' => 1,
            'status' => 'reserved',
            'expires_at' => now()->addDay(),
        ];
    }
}
