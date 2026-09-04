<?php

namespace Database\Factories;

use App\Models\LoyaltyAccount;
use App\Models\LoyaltyTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoyaltyTransaction>
 */
class LoyaltyTransactionFactory extends Factory
{
    protected $model = LoyaltyTransaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $points = $this->faker->randomFloat(2, 1, 100);

        return [
            'loyalty_account_id' => LoyaltyAccount::factory(),
            'type' => 'earn',
            'points' => $points,
            'balance_after' => $points,
            'description' => 'Points earned',
        ];
    }
}
