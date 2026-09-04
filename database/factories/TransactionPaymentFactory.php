<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\TransactionPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionPayment>
 */
class TransactionPaymentFactory extends Factory
{
    protected $model = TransactionPayment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_id' => Transaction::factory(),
            'payment_method' => 'cash',
            'amount' => $this->faker->randomFloat(2, 5, 200),
            'change_amount' => 0,
            'status' => 'completed',
        ];
    }
}
