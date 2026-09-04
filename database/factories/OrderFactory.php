<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 10, 300);

        return [
            'order_number' => 'ORD-'.strtoupper(Str::random(10)),
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'subtotal' => $subtotal,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'shipping_amount' => 0,
            'total' => $subtotal,
            'fulfillment_type' => 'pickup',
            'placed_at' => now(),
        ];
    }

    /**
     * An order that has been fully paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes): array => [
            'payment_status' => 'paid',
            'amount_paid' => $attributes['total'],
            'paid_at' => now(),
        ]);
    }
}
