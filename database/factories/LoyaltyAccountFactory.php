<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\LoyaltyAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoyaltyAccount>
 */
class LoyaltyAccountFactory extends Factory
{
    protected $model = LoyaltyAccount::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'points_balance' => 0,
            'total_points_earned' => 0,
            'total_points_redeemed' => 0,
            'is_active' => true,
        ];
    }
}
