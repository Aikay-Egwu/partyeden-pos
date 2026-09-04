<?php

namespace Database\Factories;

use App\Models\InventoryMovement;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryMovement>
 */
class InventoryMovementFactory extends Factory
{
    protected $model = InventoryMovement::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'variant_id' => null,
            'location_id' => Location::factory(),
            'type' => 'adjustment',
            'quantity' => $this->faker->randomFloat(2, 1, 50),
            'reason' => 'Manual adjustment',
        ];
    }
}
