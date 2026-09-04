<?php

namespace Database\Factories;

use App\Models\GiftCard;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<GiftCard>
 */
class GiftCardFactory extends Factory
{
    protected $model = GiftCard::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 10, 200);

        return [
            'code' => 'GC-'.strtoupper(Str::random(10)),
            'original_amount' => $amount,
            'current_balance' => $amount,
            'status' => 'active',
            'issued_at' => now(),
        ];
    }
}
