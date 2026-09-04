<?php

namespace Database\Factories;

use App\Models\PriceHistory;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceHistory>
 */
class PriceHistoryFactory extends Factory
{
    protected $model = PriceHistory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'variant_id' => null,
            'cost_price' => $this->faker->randomFloat(2, 1, 100),
            'retail_price' => $this->faker->randomFloat(2, 5, 200),
            'reason' => 'Price update',
        ];
    }
}
