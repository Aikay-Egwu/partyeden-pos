<?php

namespace Database\Factories;

use App\Models\Occasion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Occasion>
 */
class OccasionFactory extends Factory
{
    protected $model = Occasion::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = rtrim($this->faker->unique()->sentence(2), '.');

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
