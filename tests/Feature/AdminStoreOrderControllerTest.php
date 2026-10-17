<?php

declare(strict_types=1);

use App\Jobs\SendStoreOrderPaymentLinkEmail;
use App\Models\Color;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use App\Services\StoreOrderService;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Stripe\PaymentLink;
use Stripe\Price;

uses(RefreshDatabase::class);

function createStoreOrderAdmin(): User
{
    return User::factory()->create([
        'permissions' => ['*'],
    ]);
}

test('guest cannot access store order create page', function (): void {
    $response = $this->get('/admin/store-orders/create');

    $response->assertRedirect('/login');
});

test('admin can view store order create page', function (): void {
    $admin = createStoreOrderAdmin();

    Color::query()->create([
        'name' => 'Rose Gold',
        'hex_code' => '#B76E79',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->get('/admin/store-orders/create');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/store-orders/create')
        ->has('availableColors')
        ->has('deliveryZones')
        ->has('checkoutTimezone')
    );
});

test('admin can search products for store orders', function (): void {
    $admin = createStoreOrderAdmin();

    $product = Product::factory()->create([
        'name' => 'Custom Helium Balloon Bundle',
        'sku' => 'BALLOON-001',
        'selling_price' => 24.99,
        'customise_text' => true,
        'customise_color' => true,
        'is_active' => true,
    ]);

    Variant::factory()->create([
        'product_id' => $product->id,
        'name' => 'Large 34 inch',
        'sku' => 'BALLOON-001-LG',
        'price_adjustment' => 5.00,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->getJson('/admin/store-orders/products?query=Helium');

    $response->assertOk();
    $response->assertJsonCount(1);
    $response->assertJsonFragment([
        'name' => 'Custom Helium Balloon Bundle',
        'sku' => 'BALLOON-001',
        'selling_price' => 24.99,
    ]);
    $response->assertJsonFragment([
        'sku' => 'BALLOON-001-LG',
        'price' => 29.99,
    ]);
});

test('admin can create store order with phone source and single-use Stripe payment link', function (): void {
    Queue::fake();

    $admin = createStoreOrderAdmin();

    $product = Product::factory()->create([
        'name' => 'Number Foil Balloon',
        'sku' => 'NUM-FOIL-1',
        'selling_price' => 12.50,
        'is_active' => true,
    ]);

    $color = Color::query()->create([
        'name' => 'Gold',
        'hex_code' => '#FFD700',
        'is_active' => true,
    ]);

    // Use real Stripe objects so PHP return-type hints are satisfied.
    // The mock should return the URL with the prefilled email parameter
    // since that's what the real createPaymentLink() method would produce.
    $mockPrice = Price::constructFrom(['id' => 'price_test_123']);
    $mockPaymentLink = PaymentLink::constructFrom([
        'id' => 'plink_test_phone_123',
        'url' => 'https://buy.stripe.com/test_phone_123?prefilled_email=sarah%40example.com',
    ]);

    $mockStripe = Mockery::mock(StripeService::class);
    $mockStripe->shouldReceive('createOneOffPrice')
        ->andReturn($mockPrice);
    $mockStripe->shouldReceive('createPaymentLink')
        ->andReturn($mockPaymentLink);
    app()->instance(StripeService::class, $mockStripe);

    // Force StoreOrderService to be re-resolved with the new mock
    app()->forgetInstance(StoreOrderService::class);

    $payload = [
        'order_source' => 'phone',
        'customer' => [
            'first_name' => 'Sarah',
            'last_name' => 'Connor',
            'phone' => '07123456789',
            'email' => 'sarah@example.com',
        ],
        'fulfillment_type' => 'pickup',
        'expected_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 12.50,
                'customization_text' => 'Happy Birthday Sarah',
                'customization_font' => 'Pacifico',
                'customization_primary_color_id' => $color->id,
                'instructions' => 'Inflate with ribbon attached',
            ],
        ],
        'shipping_amount' => 0,
        'notes' => 'Customer will collect at 2pm',
        'send_link_via' => 'copy',
        'generate_payment_link' => true,
    ];

    $response = $this->actingAs($admin)->post('/admin/store-orders', $payload);

    $response->assertSessionHasNoErrors();

    $order = Order::latest('created_at')->first();
    expect($order)->not->toBeNull();
    expect($order->order_source)->toBe('phone');
    expect($order->payment_status)->toBe('unpaid');
    expect($order->payment_method)->toBe('stripe');
    expect($order->stripe_payment_link_id)->toBe('plink_test_phone_123');
    expect($order->stripe_payment_link_url)->toBe('https://buy.stripe.com/test_phone_123?prefilled_email=sarah%40example.com');
    expect($order->subtotal)->toBe('25.0000');
    expect($order->total)->toBe('25.0000');
    expect($order->fulfillment_type)->toBe('pickup');

    // Customer was created or updated
    expect($order->customer)->not->toBeNull();
    expect($order->customer->first_name)->toBe('Sarah');
    expect($order->customer->phone)->toBe('07123456789');

    // Order item was created with customizations
    $item = $order->items->first();
    expect($item)->not->toBeNull();
    expect($item->product_id)->toBe($product->id);
    expect($item->quantity)->toBe('2.0000');
    expect($item->customization_text)->toBe('Happy Birthday Sarah');
    expect($item->customization_font)->toBe('Pacifico');
    expect($item->customization_primary_color_id)->toBe($color->id);

    $response->assertRedirect("/admin/orders/{$order->id}");
    $response->assertSessionHas('payment_link_url', 'https://buy.stripe.com/test_phone_123?prefilled_email=sarah%40example.com');

    // Queue should NOT be dispatched because send_link_via was copy
    Queue::assertNotPushed(SendStoreOrderPaymentLinkEmail::class);
});

test('admin can create store order with email link dispatch', function (): void {
    Queue::fake();

    $admin = createStoreOrderAdmin();

    $product = Product::factory()->create([
        'name' => 'Standard Latex Balloon Bunch',
        'sku' => 'LATEX-BUNCH',
        'selling_price' => 15.00,
        'is_active' => true,
    ]);

    // Use real Stripe objects so PHP return-type hints are satisfied
    $mockPrice = Price::constructFrom(['id' => 'price_test_456']);
    $mockPaymentLink = PaymentLink::constructFrom([
        'id' => 'plink_test_email_456',
        'url' => 'https://buy.stripe.com/test_email_456',
    ]);

    $mockStripe = Mockery::mock(StripeService::class);
    $mockStripe->shouldReceive('createOneOffPrice')
        ->andReturn($mockPrice);
    $mockStripe->shouldReceive('createPaymentLink')
        ->andReturn($mockPaymentLink);
    app()->instance(StripeService::class, $mockStripe);

    // Force StoreOrderService to be re-resolved with the new mock
    app()->forgetInstance(StoreOrderService::class);

    $payload = [
        'order_source' => 'whatsapp',
        'customer' => [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '07999888777',
            'email' => 'john.doe@example.com',
        ],
        'fulfillment_type' => 'delivery',
        'shipping_address_line1' => '10 High Street',
        'shipping_city' => 'Manchester',
        'delivery_postcode' => 'M1 1AA',
        'expected_at' => now()->addDays(1)->format('Y-m-d H:i:s'),
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 15.00,
            ],
        ],
        'shipping_amount' => 5.00,
        'send_link_via' => 'email',
        'generate_payment_link' => true,
    ];

    $response = $this->actingAs($admin)->post('/admin/store-orders', $payload);

    $response->assertSessionHasNoErrors();

    $order = Order::latest('created_at')->first();
    expect($order)->not->toBeNull();
    expect($order->order_source)->toBe('whatsapp');
    expect($order->shipping_amount)->toBe('5.0000');
    expect($order->total)->toBe('20.0000');

    $response->assertRedirect("/admin/orders/{$order->id}");

    // Email job should be pushed because send_link_via was email
    Queue::assertPushed(SendStoreOrderPaymentLinkEmail::class);
});

test('admin can resend payment link or email customer', function (): void {
    Queue::fake();

    $admin = createStoreOrderAdmin();

    $customer = Customer::query()->create([
        'first_name' => 'Emma',
        'last_name' => 'Watson',
        'email' => 'emma@example.com',
        'phone' => '07111222333',
        'is_active' => true,
    ]);

    $order = Order::query()->create([
        'order_number' => 'ORD-RESEND-01',
        'customer_id' => $customer->id,
        'order_source' => 'phone',
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'stripe_payment_link_id' => 'plink_existing_1',
        'stripe_payment_link_url' => 'https://buy.stripe.com/existing_1',
        'subtotal' => 20,
        'total' => 20,
        'fulfillment_type' => 'pickup',
    ]);

    $response = $this->actingAs($admin)->post("/admin/store-orders/{$order->id}/resend-link", [
        'send_email' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    Queue::assertPushed(SendStoreOrderPaymentLinkEmail::class);
});

test('admin cannot resend payment link for already paid order', function (): void {
    $admin = createStoreOrderAdmin();

    $order = Order::query()->create([
        'order_number' => 'ORD-PAID-01',
        'order_source' => 'phone',
        'payment_status' => 'paid',
        'subtotal' => 20,
        'total' => 20,
        'fulfillment_type' => 'pickup',
    ]);

    $response = $this->actingAs($admin)->post("/admin/store-orders/{$order->id}/resend-link", [
        'send_email' => false,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'This order is already marked as paid.');
});
