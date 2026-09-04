<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'po_number' => 'PO-'.strtoupper(Str::random(10)),
            'supplier_id' => Supplier::factory(),
            'status' => 'draft',
            'order_date' => now()->toDateString(),
            'total_amount' => $this->faker->randomFloat(2, 50, 2000),
            'currency' => 'GBP',
        ];
    }
}
