<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\SupplierProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplierProduct>
 */
class SupplierProductFactory extends Factory
{
    protected $model = SupplierProduct::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'product_id' => Product::factory(),
            'supplier_sku' => strtoupper($this->faker->bothify('SKU-????##')),
            'cost_price' => $this->faker->randomFloat(2, 1, 100),
            'currency' => 'GBP',
            'min_order_qty' => 1,
            'is_preferred' => false,
        ];
    }
}
