<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ReturnedItem;
use App\Models\ReturnModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReturnedItem>
 */
class ReturnedItemFactory extends Factory
{
    protected $model = ReturnedItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'return_id' => ReturnModel::factory(),
            'product_id' => Product::factory(),
            'variant_id' => null,
            'quantity' => 1,
            'refund_amount' => $this->faker->randomFloat(2, 1, 50),
            'condition' => 'good',
            'disposition' => 'return_to_stock',
        ];
    }
}
