<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = rtrim($this->faker->sentence(3), '.');

        return [
            'name' => $name,
            'sku' => strtoupper(Str::random(8)),
            'description' => $this->faker->paragraph(),
            'cost_price' => $this->faker->randomFloat(4, 1, 100),
            'selling_price' => $this->faker->randomFloat(4, 5, 200),
            'product_type' => 'standard',
            'is_active' => true,
            'track_inventory' => $this->faker->boolean(),
            'reorder_level' => $this->faker->randomFloat(4, 1, 50),
            'unit' => 'each',
        ];
    }
}
