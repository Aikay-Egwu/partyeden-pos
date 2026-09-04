<?php

use App\Models\Attribute;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can add variant to product', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();

    $this->post(route('products.variants.store', $product), [
        'sku' => 'VAR-123',
        'name' => 'Red Large',
        'price_adjustment' => 5.00,
    ])->assertRedirect();

    $this->assertDatabaseHas('variants', [
        'sku' => 'VAR-123',
        'product_id' => $product->id,
        'price_adjustment' => 5.00,
    ]);
});

test('admin can update product variant', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id, 'sku' => 'OLD-SKU']);

    $this->put(route('products.variants.update', [$product, $variant]), [
        'sku' => 'NEW-SKU',
        'name' => 'Blue Large',
    ])->assertRedirect();

    $this->assertDatabaseHas('variants', [
        'id' => $variant->id,
        'sku' => 'NEW-SKU',
    ]);
});

test('admin can delete product variant', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id]);

    $this->delete(route('products.variants.destroy', [$product, $variant]))
        ->assertRedirect();

    $this->assertSoftDeleted('variants', [
        'id' => $variant->id,
    ]);
});

test('admin cannot update a variant that belongs to another product', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $product = Product::factory()->create();
    $otherProduct = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $otherProduct->id]);

    $this->put(route('products.variants.update', [$product, $variant]), [
        'sku' => 'BLOCKED-SKU',
        'name' => 'Blocked Variant',
    ])->assertNotFound();
});

test('admin cannot delete a variant that belongs to another product', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $product = Product::factory()->create();
    $otherProduct = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $otherProduct->id]);

    $this->delete(route('products.variants.destroy', [$product, $variant]))
        ->assertNotFound();
});

test('admin can create a variant with selected attribute values', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();

    // Build an attribute with two values (no factories exist for these models).
    $attribute = Attribute::create([
        'name' => 'Size',
        'code' => 'size-'.uniqid(),
        'type' => 'select',
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $small = $attribute->values()->create(['value' => 'Small', 'sort_order' => 0, 'is_active' => true]);
    $large = $attribute->values()->create(['value' => 'Large', 'sort_order' => 1, 'is_active' => true]);

    $this->post(route('products.variants.store', $product), [
        'sku' => 'VAR-ATTR-1',
        'name' => 'Small/Large combo',
        'attributes' => [$small->id, $large->id],
    ])->assertRedirect();

    $variant = Variant::where('sku', 'VAR-ATTR-1')->firstOrFail();
    expect($variant->attributeValues()->pluck('attribute_values.id')->all())
        ->toContain($small->id, $large->id)
        ->toHaveCount(2);
});

test('updating a variant replaces its attribute values', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id]);

    $attribute = Attribute::create([
        'name' => 'Size',
        'code' => 'size-'.uniqid(),
        'type' => 'select',
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $small = $attribute->values()->create(['value' => 'Small', 'sort_order' => 0, 'is_active' => true]);
    $large = $attribute->values()->create(['value' => 'Large', 'sort_order' => 1, 'is_active' => true]);
    $variant->attributeValues()->attach($small->id);

    $this->put(route('products.variants.update', [$product, $variant]), [
        'sku' => $variant->sku,
        'attributes' => [$large->id],
    ])->assertRedirect();

    expect($variant->attributeValues()->pluck('attribute_values.id')->all())
        ->toEqual([$large->id]);
});
