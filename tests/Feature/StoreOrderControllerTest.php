<?php

use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Variant;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;

uses(RefreshDatabase::class);

test('it creates a delivery order with add-on child items', function () {
    $product = Product::factory()->create(['selling_price' => 20.00, 'is_active' => true]);
    $addOn = Product::factory()->create(['selling_price' => 5.00, 'is_active' => true]);

    $zone = DeliveryZone::create([
        'name' => 'Central',
        'delivery_price' => 7.50,
        'min_order_amount' => 10.00,
        'is_active' => true,
    ]);

    DeliveryZonePostcodePrefix::create([
        'delivery_zone_id' => $zone->id,
        'code_prefix' => 'SW1A',
        'is_active' => true,
    ]);

    app(CartService::class)->add($product->id, null, 2, [
        'customization_text' => 'Happy Birthday',
        'add_on_ids' => [$addOn->id],
    ]);

    $response = $this->post(route('store.orders.store'), [
        'first_name' => 'Chioma',
        'last_name' => 'Eden',
        'email' => 'chioma@example.com',
        'phone' => '08000000000',
        'notes' => 'Leave at reception',
        'fulfillment_type' => 'delivery',
        'delivery_postcode' => 'SW1A 1AA',
        'address_line1' => '10 Downing Street',
        'address_line2' => 'Flat 2',
        'city' => 'London',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('orders', [
        'fulfillment_type' => 'delivery',
        'delivery_zone_id' => $zone->id,
        'delivery_postcode' => 'SW1A1AA',
        'shipping_amount' => '7.5000',
        'total' => '57.5000',
        // Structured address fields persisted for delivery orders
        'shipping_address_line1' => '10 Downing Street',
        'shipping_address_line2' => 'Flat 2',
        'shipping_city' => 'London',
    ]);

    $parentItem = OrderItem::query()
        ->whereNull('parent_order_item_id')
        ->first();

    expect($parentItem)->not->toBeNull();

    $this->assertDatabaseHas('order_items', [
        'parent_order_item_id' => $parentItem->id,
        'product_id' => $addOn->id,
        'quantity' => '2.0000',
        'total' => '10.0000',
    ]);
});

test('it rejects delivery when the postcode does not match a zone', function () {
    $product = Product::factory()->create(['selling_price' => 20.00, 'is_active' => true]);

    app(CartService::class)->add($product->id, null, 1);

    $this->from(route('store.checkout'))
        ->post(route('store.orders.store'), [
            'first_name' => 'Chioma',
            'last_name' => 'Eden',
            'email' => 'chioma@example.com',
            'fulfillment_type' => 'delivery',
            'delivery_postcode' => 'ZZ1 1ZZ',
            'address_line1' => '10 Downing Street',
            'city' => 'London',
        ])
        ->assertRedirect(route('store.checkout'))
        ->assertSessionHasErrors(['delivery_postcode']);
});

test('it rejects a delivery order without a structured address', function () {
    $product = Product::factory()->create(['selling_price' => 20.00, 'is_active' => true]);

    app(CartService::class)->add($product->id, null, 1);

    $this->from(route('store.checkout'))
        ->post(route('store.orders.store'), [
            'first_name' => 'Chioma',
            'last_name' => 'Eden',
            'email' => 'chioma@example.com',
            'fulfillment_type' => 'delivery',
            'delivery_postcode' => 'SW1A 1AA',
        ])
        ->assertRedirect(route('store.checkout'))
        ->assertSessionHasErrors(['address_line1', 'city']);

    expect(Order::count())->toBe(0);
});

test('it rejects an order when a cart item exceeds available stock', function () {
    $product = Product::factory()->create([
        'selling_price' => 20.00,
        'is_active' => true,
        'track_inventory' => true,
    ]);

    $location = Location::create([
        'name' => 'Main Warehouse',
        'code' => 'MAIN',
        'is_active' => true,
    ]);

    // Only 1 unit available, but the cart asks for 2
    InventoryBalance::create([
        'product_id' => $product->id,
        'variant_id' => null,
        'location_id' => $location->id,
        'quantity' => 1,
        'reserved_quantity' => 0,
    ]);

    app(CartService::class)->add($product->id, null, 2);

    $this->from(route('store.checkout'))
        ->post(route('store.orders.store'), [
            'first_name' => 'Chioma',
            'last_name' => 'Eden',
            'email' => 'chioma@example.com',
            'fulfillment_type' => 'pickup',
        ])
        ->assertRedirect(route('store.checkout'))
        ->assertSessionHas('error');

    expect(Order::count())->toBe(0);
});

test('it persists the selected variant on the parent order item', function () {
    $product = Product::factory()->create(['selling_price' => 20.00, 'is_active' => true]);
    $variant = Variant::factory()->create([
        'product_id' => $product->id,
        'name' => 'Deluxe Shape',
        'price_adjustment' => 3.50,
        'is_active' => true,
    ]);

    app(CartService::class)->add($product->id, $variant->id, 1);

    $response = $this->post(route('store.orders.store'), [
        'first_name' => 'Chioma',
        'last_name' => 'Eden',
        'email' => 'chioma@example.com',
        'phone' => '08000000000',
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('order_items', [
        'product_id' => $product->id,
        'variant_id' => $variant->id,
        'parent_order_item_id' => null,
        'unit_price' => '23.5000',
        'total' => '23.5000',
    ]);
});

test('order confirmation requires a valid signed URL', function () {
    $product = Product::factory()->create(['selling_price' => 20.00, 'is_active' => true]);

    app(CartService::class)->add($product->id, null, 1);

    $response = $this->post(route('store.orders.store'), [
        'first_name' => 'Chioma',
        'last_name' => 'Eden',
        'email' => 'chioma@example.com',
        'fulfillment_type' => 'pickup',
    ]);

    $order = Order::firstOrFail();

    // The redirect issued at placement carries a valid signature
    $signedUrl = URL::signedRoute('store.orders.confirmation', ['order' => $order->id]);
    $response->assertRedirect($signedUrl);
    $this->get($signedUrl)->assertOk();

    // Accessing the confirmation page without a signature is denied
    $this->get(route('store.orders.confirmation', ['order' => $order->id]))
        ->assertForbidden();
});
