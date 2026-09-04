<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionItem>
 */
class TransactionItemFactory extends Factory
{
    protected $model = TransactionItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = $this->faker->randomFloat(2, 1, 50);

        return [
            'transaction_id' => Transaction::factory(),
            'product_id' => Product::factory(),
            'product_name' => rtrim($this->faker->sentence(2), '.'),
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total' => $unitPrice,
        ];
    }
}
