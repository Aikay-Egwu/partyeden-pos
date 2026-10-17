<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stripe\PaymentIntent;
use Stripe\Refund;

uses(RefreshDatabase::class);

function createAdminUser(): User
{
    return User::factory()->create([
        'permissions' => ['*'],
    ]);
}

function createOrderCustomer(array $attributes = []): Customer
{
    return Customer::query()->create(array_merge([
        'first_name' => 'Admin',
        'last_name' => 'Customer',
        'email' => fake()->unique()->safeEmail(),
        'phone' => '08000000000',
        'is_active' => true,
    ], $attributes));
}

function createAdminOrder(Customer $customer, array $attributes = []): Order
{
    return Order::query()->create(array_merge([
        'order_number' => 'ORD-ADMIN-'.strtoupper(substr(uniqid(), -6)),
        'customer_id' => $customer->id,
        'status' => 'pending',
        'payment_status' => 'paid',
        'subtotal' => 50,
        'tax_amount' => 0,
        'discount_amount' => 0,
        'loyalty_points_redeemed' => 0,
        'loyalty_points_earned' => 0,
        'shipping_amount' => 0,
        'total' => 50,
        'fulfillment_type' => 'pickup',
        'placed_at' => now(),
    ], $attributes));
}

test('admin can bulk confirm eligible orders', function (): void {
    $admin = createAdminUser();
    $customer = createOrderCustomer();
    $pendingOrder = createAdminOrder($customer, ['status' => 'pending']);
    $deliveredOrder = createAdminOrder($customer, ['status' => 'delivered']);

    $response = $this->actingAs($admin)->post('/admin/orders/bulk-confirm', [
        'order_ids' => [$pendingOrder->id, $deliveredOrder->id],
    ]);

    $response->assertRedirect();

    expect($pendingOrder->fresh()->status)->toBe('confirmed')
        ->and($deliveredOrder->fresh()->status)->toBe('delivered');
});

test('order export respects status filters', function (): void {
    $admin = createAdminUser();
    $customer = createOrderCustomer();
    $confirmedOrder = createAdminOrder($customer, [
        'status' => 'confirmed',
        'order_number' => 'ORD-CONFIRMED',
    ]);
    createAdminOrder($customer, [
        'status' => 'pending',
        'order_number' => 'ORD-PENDING',
    ]);

    $response = $this->actingAs($admin)->get('/admin/orders/export?status=confirmed');

    $response->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $content = $response->streamedContent();

    expect($content)->toContain($confirmedOrder->order_number)
        ->not->toContain('ORD-PENDING');
});

test('admin can refund a paid stripe order', function (): void {
    $admin = createAdminUser();
    $customer = createOrderCustomer();
    $order = createAdminOrder($customer, [
        'payment_status' => 'paid',
        'payment_method' => 'stripe',
        'stripe_charge_id' => 'ch_admin_refund_1',
    ]);

    $mock = Mockery::mock(StripeService::class);
    $mock->shouldReceive('refundPayment')
        ->once()
        ->with('ch_admin_refund_1')
        ->andReturn(new Refund('re_admin_refund_1'));
    app()->instance(StripeService::class, $mock);

    $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/refund");

    $response->assertRedirect();
    expect($order->fresh()->payment_status)->toBe('refunded');
});

test('refund falls back to the payment intent when charge id is missing', function (): void {
    $admin = createAdminUser();
    $customer = createOrderCustomer();
    $order = createAdminOrder($customer, [
        'payment_status' => 'paid',
        'payment_method' => 'stripe',
        'stripe_payment_intent_id' => 'pi_admin_refund_2',
        // stripe_charge_id intentionally left null
    ]);

    $mock = Mockery::mock(StripeService::class);
    $mock->shouldReceive('retrievePaymentIntent')
        ->once()
        ->with('pi_admin_refund_2')
        ->andReturn(new PaymentIntent('pi_admin_refund_2'));
    $mock->shouldReceive('extractChargeId')
        ->once()
        ->andReturn('ch_from_pi_2');
    $mock->shouldReceive('refundPayment')
        ->once()
        ->with('ch_from_pi_2')
        ->andReturn(new Refund('re_admin_refund_2'));
    app()->instance(StripeService::class, $mock);

    $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/refund");

    $response->assertRedirect();
    expect($order->fresh()->payment_status)->toBe('refunded');
});

test('unpaid orders cannot be refunded', function (): void {
    $admin = createAdminUser();
    $customer = createOrderCustomer();
    $order = createAdminOrder($customer, ['payment_status' => 'unpaid']);

    $response = $this->actingAs($admin)->post("/admin/orders/{$order->id}/refund");

    $response->assertRedirect();
    expect($order->fresh()->payment_status)->toBe('unpaid');
});
