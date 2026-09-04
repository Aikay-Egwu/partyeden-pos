<?php

namespace Database\Factories;

use App\Models\KitMapping;
use Illuminate\Database\Eloquent\Factories\Factory;

class KitMappingFactory extends Factory
{
    protected $model = KitMapping::class;

    public function definition(): array
    {
        return [
            'quantity' => $this->faker->randomFloat(2, 1, 10),
        ];
    }
}
