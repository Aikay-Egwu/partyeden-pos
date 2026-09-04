<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 5, 200);

        return [
            'transaction_number' => 'TXN-'.strtoupper(Str::random(12)),
            'staff_id' => Staff::factory(),
            'location_id' => Location::factory(),
            'status' => 'completed',
            'subtotal' => $subtotal,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total' => $subtotal,
        ];
    }
}
