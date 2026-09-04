<?php

declare(strict_types=1);

use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // Mock PayPal OAuth for all tests
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
            'access_token' => 'fake-token',
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ], 200),
    ]);
});

/**
 * Fake the GET order-details call made before capture to verify the
 * PayPal-authorised amount matches the server-side recomputed total.
 */
function fakePaypalOrderDetails(string $paypalOrderId, string $amount): void
{
    Http::fake([
        "https://api-m.sandbox.paypal.com/v2/checkout/orders/{$paypalOrderId}" => Http::response([
            'id' => $paypalOrderId,
            'status' => 'APPROVED',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => 'GBP',
                        'value' => $amount,
                    ],
                ],
            ],
        ], 200),
    ]);
}

test('createOrder returns paypal order ID for non-empty cart', function (): void {
    // Add a product to cart
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '15.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    Http::fake([
        'https://api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response([
            'id' => 'PAYPAL-ORDER-123',
            'status' => 'CREATED',
            'links' => [
                ['rel' => 'approve', 'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL-ORDER-123'],
            ],
        ], 201),
    ]);

    $response = $this->postJson('/payment/create-order', [
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertOk()
        ->assertJson([
            'paypalOrderId' => 'PAYPAL-ORDER-123',
            'status' => 'CREATED',
        ]);
});

test('createOrder returns 422 for empty cart', function (): void {
    $response = $this->postJson('/payment/create-order', [
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertStatus(422)
        ->assertJson(['error' => 'Your cart is empty.']);
});

test('captureOrder creates order on successful PayPal capture', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    fakePaypalOrderDetails('PAYPAL-ORDER-123', '20.00');

    Http::fake([
        'https://api-m.sandbox.paypal.com/v2/checkout/orders/PAYPAL-ORDER-123/capture' => Http::response([
            'id' => 'PAYPAL-ORDER-123',
            'status' => 'COMPLETED',
            'purchase_units' => [
                [
                    'payments' => [
                        'captures' => [
                            [
                                'id' => 'CAPTURE-456',
                                'status' => 'COMPLETED',
                                'amount' => [
                                    'currency_code' => 'GBP',
                                    'value' => '20.00',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'payer' => [
                'email_address' => 'buyer@example.com',
                'payer_id' => 'PAYER-789',
            ],
        ], 201),
    ]);

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonPath('redirectUrl', function (string $url): bool {
            return str_contains($url, '/orders/') && str_contains($url, '/confirmation');
        });

    // Verify the order was created in the database
    $this->assertDatabaseHas('orders', [
        'payment_status' => 'paid',
        'payment_method' => 'paypal',
        'paypal_order_id' => 'PAYPAL-ORDER-123',
        'paypal_capture_id' => 'CAPTURE-456',
        'paypal_payer_email' => 'buyer@example.com',
        'paypal_payer_id' => 'PAYER-789',
    ]);

    // Verify cart is cleared
    $this->get(route('store.cart'))
        ->assertOk()
        ->assertSee('Your cart is empty', false);
});

test('captureOrder returns error on failed PayPal capture', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    fakePaypalOrderDetails('BAD-ORDER', '20.00');

    Http::fake([
        'https://api-m.sandbox.paypal.com/v2/checkout/orders/BAD-ORDER/capture' => Http::response([
            'name' => 'RESOURCE_NOT_FOUND',
            'message' => 'The specified resource does not exist.',
        ], 404),
    ]);

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'BAD-ORDER',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertStatus(402)
        ->assertJson([
            'success' => false,
        ]);

    // Verify no order was created
    $this->assertDatabaseEmpty('orders');
});

test('captureOrder validates required fields', function (): void {
    $response = $this->post('/payment/capture-order', []);

    $response->assertSessionHasErrors([
        'paypalOrderId',
        'first_name',
        'last_name',
        'email',
        'fulfillment_type',
    ]);
});

test('captureOrder rejects delivery without postcode', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'delivery',
        'delivery_postcode' => '',
        'address_line1' => '10 Downing Street',
        'city' => 'London',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'error' => 'Enter a postcode for delivery.',
        ]);
});

test('createOrder rejects delivery outside the available zone', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $response = $this->postJson('/payment/create-order', [
        'email' => 'john@example.com',
        'fulfillment_type' => 'delivery',
        'delivery_postcode' => 'ZZ1 1ZZ',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'error' => 'Outside delivery zone.',
        ]);
});

test('captureOrder rejects delivery when the zone minimum order is not met', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $zone = DeliveryZone::query()->create([
        'name' => 'Central',
        'delivery_price' => 7.50,
        'min_order_amount' => 50.00,
        'is_active' => true,
    ]);

    DeliveryZonePostcodePrefix::query()->create([
        'delivery_zone_id' => $zone->id,
        'code_prefix' => 'SW1A',
        'is_active' => true,
    ]);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'delivery',
        'delivery_postcode' => 'SW1A 1AA',
        'address_line1' => '10 Downing Street',
        'city' => 'London',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'error' => 'This delivery zone requires a higher minimum order value.',
        ]);
});

test('captureOrder rejects a delivery capture without a structured address', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    // Like the other required-field checks, validation failures redirect
    // back with session errors (JSON rendering is reserved for api/* routes)
    $response = $this->post('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'delivery',
        'delivery_postcode' => 'SW1A 1AA',
    ]);

    $response->assertSessionHasErrors(['address_line1', 'city']);

    $this->assertDatabaseEmpty('orders');
    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/capture'));
});

test('captureOrder rejects the capture when a cart item exceeds available stock', function (): void {
    $product = Product::factory()->create([
        'is_active' => true,
        'selling_price' => '20.00',
        'track_inventory' => true,
    ]);

    $location = Location::create([
        'name' => 'Main Warehouse',
        'code' => 'MAIN',
        'is_active' => true,
    ]);

    // Only 1 unit on hand, cart asks for 2 — must be rejected before charging
    InventoryBalance::create([
        'product_id' => $product->id,
        'variant_id' => null,
        'location_id' => $location->id,
        'quantity' => 1,
        'reserved_quantity' => 0,
    ]);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertStatus(422)
        ->assertJson(['success' => false]);

    // No order created and PayPal was never asked to capture the payment
    $this->assertDatabaseEmpty('orders');
    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/capture'));
});

test('captureOrder rejects capture when the PayPal amount does not match the order total', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 2, // Cart total is 40.00 but PayPal order was authorised for 20.00
    ]);

    fakePaypalOrderDetails('PAYPAL-ORDER-123', '20.00');

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'error' => 'The payment amount does not match your order total. Please restart checkout.',
        ]);

    // No order created and no capture request ever sent to PayPal
    $this->assertDatabaseEmpty('orders');
    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/capture'));
});

test('captureOrder rejects a PayPal order ID that already produced an order', function (): void {
    $product = Product::factory()->create(['is_active' => true, 'selling_price' => '20.00']);

    $this->post(route('store.cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    // An order already exists for this PayPal order ID
    Order::create([
        'order_number' => 'ORD-EXISTING-1',
        'paypal_order_id' => 'PAYPAL-ORDER-123',
        'payment_status' => 'paid',
    ]);

    $response = $this->postJson('/payment/capture-order', [
        'paypalOrderId' => 'PAYPAL-ORDER-123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'fulfillment_type' => 'pickup',
    ]);

    $response->assertStatus(409)
        ->assertJson([
            'success' => false,
            'error' => 'This payment has already been processed.',
        ]);

    // Still only the original order — no duplicate created
    expect(Order::count())->toBe(1);
    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/capture'));
});
