<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Staff;
use App\Models\TillSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TillSession>
 */
class TillSessionFactory extends Factory
{
    protected $model = TillSession::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'staff_id' => Staff::factory(),
            'location_id' => Location::factory(),
            'opened_at' => now(),
            'opening_balance' => 100,
            'cash_sales' => 0,
            'status' => 'open',
        ];
    }

    /**
     * A session that has already been closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'closed_at' => now(),
            'closing_balance' => 100,
            'expected_balance' => 100,
            'status' => 'closed',
        ]);
    }
}
