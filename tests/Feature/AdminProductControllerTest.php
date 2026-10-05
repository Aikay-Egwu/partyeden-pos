<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\TaxCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('guests cannot access admin products', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin products', function () {
    $user = User::factory()->create(['permissions' => []]);
    $this->actingAs($user);
    $this->get(route('products.index'))->assertForbidden();
});

test('admin can access products index', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $this->actingAs($user);
    $this->get(route('products.index'))->assertOk();
});

test('admin can create product', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $this->post(route('products.store'), [
        'name' => 'Test Product',
        'sku' => 'TEST-123',
        'product_type' => 'standard',
        'turnover_time_hours' => 2.5,
    ])->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'sku' => 'TEST-123',
        'turnover_time_hours' => 2.5,
    ]);
});

// ── Default save flow: redirect to products list ──────────────────────

test('admin can update product and is redirected to products list', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create([
        'name' => 'Original Name',
        'description' => 'Original description',
        'selling_price' => 9.99,
    ]);

    $response = $this->from(route('products.edit', $product))->put(
        route('products.update', $product),
        [
            'name' => 'Updated Name',
            'sku' => $product->sku,
            'description' => 'Updated description',
            'selling_price' => 19.99,
            'product_type' => 'standard',
            'continue_editing' => false,
        ],
    );

    // Default flow redirects to the products index
    $response->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Name',
        'description' => 'Updated description',
        'selling_price' => 19.99,
    ]);
});

// ── "Update and Continue" flow: stay on the edit page ────────────────

test('admin can update product and remain on the edit page via continue_editing flag', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create([
        'name' => 'Original Name',
    ]);

    $response = $this->from(route('products.edit', $product))->put(
        route('products.update', $product),
        [
            'name' => 'Saved And Stayed',
            'sku' => $product->sku,
            'product_type' => 'standard',
            'continue_editing' => true,
        ],
    );

    // "Update and Continue" flow redirects back to the edit page
    $response->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Saved And Stayed',
    ]);
});

// ── All editable product fields persist correctly ─────────────────────

test('update saves all editable product fields in both redirect modes', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    $taxCategory = TaxCategory::factory()->create();

    $product = Product::factory()->create([
        'name' => 'Initial',
        'sku' => 'INIT-001',
        'barcode' => '1111111111',
        'description' => 'Initial desc',
        'cost_price' => 1.00,
        'selling_price' => 2.00,
        'turnover_time_hours' => 1,
        'product_type' => 'standard',
        'is_active' => true,
        'track_inventory' => true,
        'reorder_level' => 5,
        'unit' => 'each',
        'customise_color' => false,
        'customise_text' => false,
        'preorder' => false,
        'is_online_visible' => true,
        'best_seller_enabled' => false,
        'best_seller_rank' => null,
    ]);

    $payload = [
        'name' => 'Comprehensive Update',
        'sku' => 'COMP-001',
        'barcode' => '9999999999',
        'description' => 'Comprehensive updated description text.',
        'cost_price' => '12.50',
        'selling_price' => '34.75',
        'turnover_time_hours' => '7.5',
        'product_type' => 'service',
        'is_active' => false,
        'track_inventory' => false,
        'reorder_level' => '2',
        'unit' => 'hour',
        'customise_color' => true,
        'customise_text' => true,
        'preorder' => true,
        'is_online_visible' => false,
        'best_seller_enabled' => true,
        'best_seller_rank' => 3,
        'category_ids' => [$categoryA->id, $categoryB->id],
        'tax_category_id' => $taxCategory->id,
    ];

    // 1. Default save mode (redirects to list) — all fields persisted
    $this->put(
        route('products.update', $product),
        array_merge($payload, ['continue_editing' => false]),
    )->assertRedirect(route('products.index'));

    $product->refresh();
    expect($product->name)->toBe('Comprehensive Update');
    expect($product->sku)->toBe('COMP-001');
    expect($product->barcode)->toBe('9999999999');
    expect($product->description)->toBe('Comprehensive updated description text.');
    expect((float) $product->cost_price)->toBe(12.50);
    expect((float) $product->selling_price)->toBe(34.75);
    expect((float) $product->turnover_time_hours)->toBe(7.5);
    expect($product->product_type)->toBe('service');
    expect($product->is_active)->toBeFalse();
    expect($product->track_inventory)->toBeFalse();
    expect((float) $product->reorder_level)->toBe(2.0);
    expect($product->unit)->toBe('hour');
    expect($product->customise_color)->toBeTrue();
    expect($product->customise_text)->toBeTrue();
    expect($product->preorder)->toBeTrue();
    expect($product->is_online_visible)->toBeFalse();
    expect($product->best_seller_enabled)->toBeTrue();
    expect($product->best_seller_rank)->toBe(3);
    expect($product->tax_category_id)->toBe($taxCategory->id);
    expect($product->categories->pluck('id')->sort()->values()->all())
        ->toBe([$categoryA->id, $categoryB->id]);

    // 2. "Update and Continue" also persists the exact same set of fields
    $product2 = Product::factory()->create([
        'name' => 'Initial 2',
        'sku' => 'INIT-002',
    ]);

    $payload2 = [
        'name' => 'Continue Save Update',
        'sku' => 'CONT-002',
        'barcode' => '8888888888',
        'description' => 'Saved while staying on page.',
        'cost_price' => '3.33',
        'selling_price' => '7.77',
        'turnover_time_hours' => '2.25',
        'product_type' => 'kit',
        'is_active' => true,
        'track_inventory' => true,
        'reorder_level' => '10',
        'unit' => 'kit',
        'customise_color' => false,
        'customise_text' => true,
        'preorder' => false,
        'is_online_visible' => true,
        'best_seller_enabled' => false,
        'best_seller_rank' => null,
        'category_ids' => [$categoryB->id],
        'tax_category_id' => $taxCategory->id,
    ];

    $this->put(
        route('products.update', $product2),
        array_merge($payload2, ['continue_editing' => true]),
    )->assertRedirect(route('products.edit', $product2));

    $product2->refresh();
    expect($product2->name)->toBe('Continue Save Update');
    expect($product2->sku)->toBe('CONT-002');
    expect($product2->barcode)->toBe('8888888888');
    expect($product2->description)->toBe('Saved while staying on page.');
    expect((float) $product2->cost_price)->toBe(3.33);
    expect((float) $product2->selling_price)->toBe(7.77);
    expect((float) $product2->turnover_time_hours)->toBe(2.25);
    expect($product2->product_type)->toBe('kit');
    expect($product2->unit)->toBe('kit');
    expect($product2->customise_text)->toBeTrue();
    expect((float) $product2->reorder_level)->toBe(10.0);
    expect($product2->categories->pluck('id')->all())->toBe([$categoryB->id]);
});

// ── continue_editing flag is never persisted to the products table ────

test('continue_editing flag is not stored on the product record', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();

    $this->put(route('products.update', $product), [
        'name' => 'Flag Test',
        'sku' => $product->sku,
        'product_type' => 'standard',
        'continue_editing' => true,
    ])->assertRedirect(route('products.edit', $product));

    // The products table has no such column — so if the query below runs
    // without error and the row exists, the flag was correctly excluded.
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Flag Test',
    ]);

    $raw = DB::table('products')
        ->where('id', $product->id)
        ->first();

    expect(isset($raw->continue_editing))->toBeFalse();
});

// ── Update generates an audit log entry ───────────────────────────────

test('product update records an audit log entry with old and new values', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create([
        'name' => 'Before Update',
        'selling_price' => 10.00,
    ]);

    $this->put(route('products.update', $product), [
        'name' => 'After Update',
        'sku' => $product->sku,
        'selling_price' => 25.00,
        'product_type' => 'standard',
        'continue_editing' => true,
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Product::class,
        'auditable_id' => $product->id,
        'event' => 'updated',
        'user_id' => $user->id,
        'description' => 'Product updated: After Update',
    ]);
});

// ── Validation still runs regardless of submit mode ───────────────────

test('update returns validation errors for invalid data in both save modes', function ($flag) {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();

    $this->from(route('products.edit', $product))
        ->put(route('products.update', $product), [
            'name' => '',
            'sku' => '',
            'selling_price' => -5,
            'continue_editing' => $flag,
        ])
        ->assertRedirect(route('products.edit', $product))
        ->assertSessionHasErrors(['name', 'sku', 'selling_price']);
})->with([
    'redirect to list' => [false],
    'continue editing' => [true],
]);

// ── Quick toggles from the products list ──────────────────────────────

test('admin can toggle a product status from the list', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create(['is_active' => true]);

    $this->from(route('products.index'))
        ->patch(route('products.status.toggle', $product))
        ->assertRedirect(route('products.index'));

    expect($product->fresh()->is_active)->toBeFalse();

    // Toggling again restores it
    $this->patch(route('products.status.toggle', $product));

    expect($product->fresh()->is_active)->toBeTrue();
});

test('admin can toggle a product online visibility from the list', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create(['is_online_visible' => true]);

    $this->from(route('products.index'))
        ->patch(route('products.online-visibility.toggle', $product))
        ->assertRedirect(route('products.index'));

    expect($product->fresh()->is_online_visible)->toBeFalse();

    $this->patch(route('products.online-visibility.toggle', $product));

    expect($product->fresh()->is_online_visible)->toBeTrue();
});

test('non-admin users cannot toggle product status or visibility', function () {
    $user = User::factory()->create(['permissions' => []]);
    $this->actingAs($user);
    $product = Product::factory()->create(['is_active' => true, 'is_online_visible' => true]);

    $this->patch(route('products.status.toggle', $product))->assertForbidden();
    $this->patch(route('products.online-visibility.toggle', $product))->assertForbidden();

    expect($product->fresh()->is_active)->toBeTrue();
    expect($product->fresh()->is_online_visible)->toBeTrue();
});
