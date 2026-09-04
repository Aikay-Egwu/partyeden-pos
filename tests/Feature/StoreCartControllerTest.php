<?php

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('adding an item stores it in the session cart', function () {
    $product = Product::factory()->create(['is_active' => true]);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ])->assertRedirect()->assertSessionHas('success');

    // Cart lives in the session, keyed by product/variant line
    $cart = session('cart');
    expect($cart)->toHaveCount(1);
    $line = array_values($cart)[0];
    expect($line['product_id'])->toBe($product->id)
        ->and($line['quantity'])->toBe(2);

    $this->get(route('store.cart'))->assertOk();
});

test('adding the same item again increments its quantity', function () {
    $product = Product::factory()->create(['is_active' => true]);

    $this->post(route('store.cart.add'), ['product_id' => $product->id, 'quantity' => 1]);
    $this->post(route('store.cart.add'), ['product_id' => $product->id, 'quantity' => 3]);

    $cart = session('cart');
    expect($cart)->toHaveCount(1)
        ->and(array_values($cart)[0]['quantity'])->toBe(4);
});

test('updating a line by key changes its quantity', function () {
    $product = Product::factory()->create(['is_active' => true]);
    $this->post(route('store.cart.add'), ['product_id' => $product->id, 'quantity' => 1]);
    $lineKey = array_key_first(session('cart'));

    $this->patch(route('store.cart.update'), [
        'line_key' => $lineKey,
        'quantity' => 5,
    ])->assertRedirect();

    expect(session('cart')[$lineKey]['quantity'])->toBe(5);
});

test('removing a line by key empties the cart', function () {
    $product = Product::factory()->create(['is_active' => true]);
    $this->post(route('store.cart.add'), ['product_id' => $product->id, 'quantity' => 1]);
    $lineKey = array_key_first(session('cart'));

    $this->delete(route('store.cart.remove'), ['line_key' => $lineKey])
        ->assertRedirect();

    expect(session('cart'))->toBeEmpty();
});

test('validates product exists', function () {
    $this->post(route('store.cart.add'), [
        'product_id' => 'fake-uuid',
        'quantity' => 1,
    ])->assertSessionHasErrors(['product_id']);

    expect(session('cart', []))->toBeEmpty();
});

test('rejects a variant that does not belong to the product', function () {
    $product = Product::factory()->create(['is_active' => true]);
    // Variant belongs to a different product
    $otherVariant = Variant::factory()->create();

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'variant_id' => $otherVariant->id,
        'quantity' => 1,
    ])->assertSessionHasErrors(['variant_id']);

    expect(session('cart', []))->toBeEmpty();
});
