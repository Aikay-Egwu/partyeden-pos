<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VariantFactory extends Factory
{
    protected $model = Variant::class;

    public function definition(): array
    {
        $name = $this->faker->colorName();

        return [
            'product_id' => Product::factory(),
            'name' => $name,
            'sku' => strtoupper(Str::random(10)),
            'price_adjustment' => $this->faker->randomFloat(2, -10, 10),
            'cost_price_adjustment' => $this->faker->randomFloat(2, -5, 5),
            'is_active' => true,
        ];
    }
}
