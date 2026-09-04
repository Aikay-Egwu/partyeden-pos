<?php

use App\Models\InventoryBalance;
use App\Models\Product;
use App\Models\Staff;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->getJson('/api/v1/reports/sales-summary')->assertRedirect(route('login'));
});

test('sales summary aggregates completed transactions', function () {
    $user = User::factory()->create(['permissions' => []]);
    Transaction::factory()->create(['total' => 10, 'subtotal' => 10, 'tax_amount' => 2]);
    Transaction::factory()->create(['total' => 30, 'subtotal' => 30, 'tax_amount' => 6]);
    Transaction::factory()->create(['total' => 99, 'subtotal' => 99, 'status' => 'voided']);

    $this->actingAs($user)
        ->getJson('/api/v1/reports/sales-summary')
        ->assertOk()
        ->assertJsonPath('data.total_transactions', 2)
        ->assertJsonPath('data.total_sales', 40)
        ->assertJsonPath('data.total_tax', 8)
        ->assertJsonPath('data.average_transaction_value', 20);
});

test('inventory valuation sums quantity times cost price', function () {
    $user = User::factory()->create(['permissions' => []]);
    $product = Product::factory()->create(['cost_price' => 2.50]);
    InventoryBalance::factory()->create(['product_id' => $product->id, 'quantity' => 10]);

    $this->actingAs($user)
        ->getJson('/api/v1/reports/inventory-valuation')
        ->assertOk()
        ->assertJsonPath('data.total_units', 10)
        ->assertJsonPath('data.total_value', 25);
});

test('low stock alert only reports products at or below their reorder level', function () {
    $user = User::factory()->create(['permissions' => []]);
    $lowProduct = Product::factory()->create(['reorder_level' => 20]);
    $okProduct = Product::factory()->create(['reorder_level' => 5]);
    InventoryBalance::factory()->create(['product_id' => $lowProduct->id, 'quantity' => 3]);
    InventoryBalance::factory()->create(['product_id' => $okProduct->id, 'quantity' => 500]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/low-stock')
        ->assertOk();

    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.product_id'))->toBe($lowProduct->id);
});

test('top products ranks items by revenue from completed transactions', function () {
    $user = User::factory()->create(['permissions' => []]);
    $transaction = Transaction::factory()->create();
    $bigSeller = TransactionItem::factory()->create([
        'transaction_id' => $transaction->id,
        'total' => 90,
    ]);
    $smallSeller = TransactionItem::factory()->create([
        'transaction_id' => $transaction->id,
        'total' => 10,
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/top-products')
        ->assertOk();

    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('data.0.product_id'))->toBe($bigSeller->product_id);
    expect($response->json('data.1.product_id'))->toBe($smallSeller->product_id);
});

test('staff performance lists active staff with sales totals', function () {
    $user = User::factory()->create(['permissions' => []]);
    $staff = Staff::factory()->create(['is_active' => true]);
    Staff::factory()->create(['is_active' => false]);
    Transaction::factory()->create(['staff_id' => $staff->id, 'total' => 42, 'subtotal' => 42]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/staff-performance')
        ->assertOk();

    // Inactive staff are excluded
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.id'))->toBe($staff->id);
    expect($response->json('data.0.completed_transactions'))->toBe(1);
    expect((float) $response->json('data.0.total_sales'))->toBe(42.0);
});
