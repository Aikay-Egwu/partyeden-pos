<?php

namespace Database\Factories;

use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GiftCardTransaction>
 */
class GiftCardTransactionFactory extends Factory
{
    protected $model = GiftCardTransaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 10, 200);

        return [
            'gift_card_id' => GiftCard::factory(),
            'type' => 'purchase',
            'amount' => $amount,
            'balance_after' => $amount,
            'description' => 'Gift card purchased',
        ];
    }
}
