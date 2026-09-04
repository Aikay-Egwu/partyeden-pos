<?php

namespace Database\Factories;

use App\Models\Component;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ComponentFactory extends Factory
{
    protected $model = Component::class;

    public function definition(): array
    {
        $name = rtrim($this->faker->sentence(2), '.');

        return [
            'name' => $name,
            'sku' => strtoupper(Str::random(8)),
            'description' => $this->faker->sentence(),
            'cost_price' => $this->faker->randomFloat(2, 1, 100),
            'selling_price' => $this->faker->randomFloat(2, 5, 200),
            'is_active' => true,
        ];
    }
}
