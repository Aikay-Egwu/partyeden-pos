<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can generate the next SKU via the endpoint', function () {
    $admin = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($admin);

    Product::create([
        'name' => 'Existing Product',
        'sku' => 'SKU-000010',
        'product_type' => 'standard',
    ]);

    $this->get(route('skus.generate'))
        ->assertOk()
        ->assertJsonPath('sku', 'SKU-000011');
});

test('admin can duplicate a product and receive prefilled create-form data', function () {
    $admin = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($admin);

    $product = Product::create([
        'name' => 'Original Product',
        'sku' => 'SKU-000020',
        'description' => 'Original description',
        'category_id' => null,
        'tax_category_id' => null,
        'cost_price' => 15.50,
        'selling_price' => 20.00,
        'product_type' => 'standard',
        'customise_color' => false,
        'customise_text' => false,
        'preorder' => false,
        'is_active' => true,
        'is_kit' => false,
        'track_inventory' => true,
        'reorder_level' => 5,
        'unit' => 'each',
        'is_online_visible' => true,
        'best_seller_enabled' => false,
    ]);

    $response = $this->post(route('products.duplicate', $product));

    $response->assertRedirect(route('products.create'));

    $prefill = session('prefill');

    expect($prefill['name'])->toBe('Copy of Original Product');
    expect($prefill['sku'])->toBe('SKU-000021');
    expect($prefill['description'])->toBe('Original description');
    expect($prefill['selling_price'])->toBe('20.00');
    expect($prefill['track_inventory'])->toBeTrue();
});
