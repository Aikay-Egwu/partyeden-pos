<?php

namespace Database\Factories;

use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryBalance>
 */
class InventoryBalanceFactory extends Factory
{
    protected $model = InventoryBalance::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'variant_id' => null,
            'location_id' => Location::factory(),
            'quantity' => 100,
            'reserved_quantity' => 0,
        ];
    }
}
