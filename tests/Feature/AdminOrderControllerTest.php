<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
