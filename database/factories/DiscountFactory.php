<?php

namespace Database\Factories;

use App\Models\Discount;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Discount>
 */
class DiscountFactory extends Factory
{
    protected $model = Discount::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => rtrim($this->faker->sentence(2), '.'),
            'code' => strtoupper(Str::random(8)),
            'type' => 'percentage',
            'value' => $this->faker->randomFloat(2, 5, 50),
            'is_active' => true,
            'is_stackable' => false,
            'apply_to_all' => true,
        ];
    }
}
