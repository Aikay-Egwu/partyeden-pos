<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Global search ─────────────────────────────────────────────────────

test('search requires a query string', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->getJson('/api/v1/search')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['q']);
});

test('search returns matching results grouped by type', function () {
    $user = User::factory()->create(['permissions' => []]);
    $product = Product::factory()->create(['name' => 'Balloon Arch Kit']);
    Product::factory()->create(['name' => 'Table Runner']);
    $customer = Customer::factory()->create(['first_name' => 'Balloona']);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/search?q=Balloon')
        ->assertOk();

    expect($response->json('data.products'))->toHaveCount(1);
    expect($response->json('data.products.0.id'))->toBe($product->id);
    expect($response->json('data.customers.0.id'))->toBe($customer->id);
    expect($response->json('data'))->toHaveKeys(['suppliers', 'transactions', 'orders']);
});

test('search can be limited to specific types', function () {
    $user = User::factory()->create(['permissions' => []]);
    Product::factory()->create(['name' => 'Balloon Arch Kit']);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/search?q=Balloon&types=products')
        ->assertOk();

    expect($response->json('data'))->toHaveKey('products');
    expect($response->json('data'))->not->toHaveKeys(['customers', 'suppliers']);
});

// ── Catalog: products ─────────────────────────────────────────────────

test('products can be listed by any authenticated user', function () {
    $user = User::factory()->create(['permissions' => []]);
    Product::factory()->count(2)->create();

    $this->actingAs($user)
        ->getJson('/api/v1/products')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('store creates a product in the database', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $category = Category::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/products', [
            'sku' => 'PARTY-001',
            'name' => 'Party Hat',
            'category_id' => $category->id,
            'selling_price' => 4.99,
        ])
        ->assertCreated();

    $this->assertDatabaseHas('products', [
        'sku' => 'PARTY-001',
        'name' => 'Party Hat',
        'category_id' => $category->id,
    ]);
});

test('store rejects a duplicate sku', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Product::factory()->create(['sku' => 'DUPE-01']);

    $this->actingAs($user)
        ->postJson('/api/v1/products', [
            'sku' => 'DUPE-01',
            'name' => 'Copycat',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['sku']);
});

test('users without the manage products permission cannot create products', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->postJson('/api/v1/products', [
            'sku' => 'NOPE-01',
            'name' => 'Forbidden',
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('products', 0);
});

// ── Catalog: categories ───────────────────────────────────────────────

test('categories tree returns root categories with children', function () {
    $user = User::factory()->create(['permissions' => []]);
    $parent = Category::factory()->create();
    Category::factory()->create(['parent_id' => $parent->id]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/categories-tree')
        ->assertOk();

    // Only the root category appears at the top level, child nested below
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.id'))->toBe($parent->id);
    expect($response->json('data.0.children'))->toHaveCount(1);
});
