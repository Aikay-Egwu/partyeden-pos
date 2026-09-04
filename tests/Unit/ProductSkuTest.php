<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('generate next sku starts at sku-000001 when none exist', function () {
    expect(Product::generateNextSku())->toBe('SKU-000001');
});

test('generate next sku ignores non matching values and increments from the highest numeric suffix', function () {
    Product::create(['name' => 'A', 'sku' => 'SKU-000010', 'product_type' => 'standard']);
    Product::create(['name' => 'B', 'sku' => 'SKU-000012', 'product_type' => 'standard']);
    Product::create(['name' => 'C', 'sku' => 'ABC-123', 'product_type' => 'standard']);

    expect(Product::generateNextSku())->toBe('SKU-000013');
});
