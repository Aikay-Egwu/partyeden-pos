<?php

use App\Models\Product;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it can add a product to the cart', function () {
    $product = Product::factory()->create(['selling_price' => 10.00, 'is_active' => true]);
    $cartService = app(CartService::class);

    $cartService->add($product->id, null, 1);

    $contents = $cartService->contents();
    expect($contents['count'])->toBe(1);
    expect($contents['total'])->toBe('10');
    expect($contents['items'][0]['product_id'])->toBe($product->id);
});

test('it can store customization fields', function () {
    $product = Product::factory()->create(['selling_price' => 10.00, 'is_active' => true]);
    $cartService = app(CartService::class);

    $cartService->add($product->id, null, 1, [
        'customization_text' => 'Happy Birthday',
        'customization_font' => 'Arial',
        'customization_primary_color_id' => '123',
        'customization_secondary_color_id' => '456',
    ]);

    $contents = $cartService->contents();
    expect($contents['items'][0]['customization_text'])->toBe('Happy Birthday');
    expect($contents['items'][0]['customization_font'])->toBe('Arial');
    expect($contents['items'][0]['customization_primary_color_id'])->toBe('123');
    expect($contents['items'][0]['customization_secondary_color_id'])->toBe('456');
});

test('it can update item quantity', function () {
    $product = Product::factory()->create(['selling_price' => 10.00, 'is_active' => true]);
    $cartService = app(CartService::class);

    $cartService->add($product->id, null, 1);
    $cartService->update($product->id, null, 3);

    $contents = $cartService->contents();
    expect($contents['count'])->toBe(3);
    expect($contents['total'])->toBe('30');
});

test('it can remove an item', function () {
    $product = Product::factory()->create(['selling_price' => 10.00, 'is_active' => true]);
    $cartService = app(CartService::class);

    $cartService->add($product->id, null, 1);
    $cartService->remove($product->id, null);

    $contents = $cartService->contents();
    expect($contents['count'])->toBe(0);
});

test('it keeps differently customized lines separate', function () {
    $product = Product::factory()->create(['selling_price' => 15.00, 'is_active' => true]);
    $cartService = app(CartService::class);

    $cartService->add($product->id, null, 1, [
        'customization_text' => 'Happy Birthday',
    ]);
    $cartService->add($product->id, null, 1, [
        'customization_text' => 'Welcome Home',
    ]);

    $contents = $cartService->contents();

    expect($contents['count'])->toBe(2);
    expect($contents['items'])->toHaveCount(2);
});

test('it includes add-ons in the line total', function () {
    $product = Product::factory()->create(['selling_price' => 20.00, 'is_active' => true]);
    $addOn = Product::factory()->create(['selling_price' => 5.00, 'is_active' => true]);
    $cartService = app(CartService::class);

    $cartService->add($product->id, null, 2, [
        'add_on_ids' => [$addOn->id],
    ]);

    $contents = $cartService->contents();

    expect($contents['items'][0]['add_ons'])->toHaveCount(1);
    expect($contents['items'][0]['add_on_total'])->toBe('10');
    expect($contents['items'][0]['line_total'])->toBe('50');
    expect($contents['total'])->toBe('50');
});
