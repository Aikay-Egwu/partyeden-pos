<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = $this->faker->randomFloat(2, 1, 50);

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'product_name' => rtrim($this->faker->sentence(2), '.'),
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total' => $unitPrice,
            'status' => 'pending',
        ];
    }
}
