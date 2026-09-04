<?php

namespace Database\Factories;

use App\Models\CustomerReview;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerReview>
 */
class CustomerReviewFactory extends Factory
{
    protected $model = CustomerReview::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'rating' => $this->faker->numberBetween(1, 5),
            'title' => rtrim($this->faker->sentence(3), '.'),
            'feedback' => $this->faker->paragraph(),
            'status' => 'pending',
            'is_featured' => false,
            'show_in_gallery' => false,
        ];
    }

    /**
     * A review approved for storefront display.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }
}
