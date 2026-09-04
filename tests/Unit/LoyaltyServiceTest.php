<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltySetting;
use App\Models\Order;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createCustomer(array $attributes = []): Customer
{
    return Customer::query()->create(array_merge([
        'first_name' => 'Chioma',
        'last_name' => 'Eden',
        'email' => fake()->unique()->safeEmail(),
        'phone' => '08000000000',
        'is_active' => true,
    ], $attributes));
}

function createOrder(Customer $customer, array $attributes = []): Order
{
    return Order::query()->create(array_merge([
        'order_number' => 'ORD-TEST-'.strtoupper(substr(uniqid(), -6)),
        'customer_id' => $customer->id,
        'status' => 'pending',
        'payment_status' => 'paid',
        'subtotal' => 100,
        'tax_amount' => 0,
        'discount_amount' => 0,
        'loyalty_points_redeemed' => 0,
        'loyalty_points_earned' => 0,
        'shipping_amount' => 0,
        'total' => 100,
        'fulfillment_type' => 'pickup',
        'placed_at' => now(),
    ], $attributes));
}

test('it previews a loyalty redemption against account balance and order total', function (): void {
    LoyaltySetting::query()->create([
        'points_per_currency_unit' => 1,
        'currency_value_per_point' => 0.05,
        'is_active' => true,
    ]);

    $customer = createCustomer();
    $account = LoyaltyAccount::query()->create([
        'customer_id' => $customer->id,
        'points_balance' => 120,
        'total_points_earned' => 120,
        'total_points_redeemed' => 0,
        'is_active' => true,
    ]);

    $preview = app(LoyaltyService::class)->redemptionPreview($account, 50, 20);

    expect($preview['points'])->toBe(50.0)
        ->and($preview['amount'])->toBe(2.5);
});

test('it applies a redemption transaction to an order', function (): void {
    LoyaltySetting::query()->create([
        'points_per_currency_unit' => 1,
        'currency_value_per_point' => 0.1,
        'is_active' => true,
    ]);

    $customer = createCustomer();
    $account = LoyaltyAccount::query()->create([
        'customer_id' => $customer->id,
        'points_balance' => 80,
        'total_points_earned' => 80,
        'total_points_redeemed' => 0,
        'is_active' => true,
    ]);
    $order = createOrder($customer, [
        'subtotal' => 40,
        'shipping_amount' => 5,
        'total' => 37,
        'discount_amount' => 8,
        'loyalty_points_redeemed' => 80,
    ]);

    $transaction = app(LoyaltyService::class)->applyRedemption($account, $order, 80);

    expect($transaction)->not->toBeNull()
        ->and($transaction?->type)->toBe('redeem')
        ->and((float) $account->fresh()->points_balance)->toBe(0.0)
        ->and((float) $account->fresh()->total_points_redeemed)->toBe(80.0);
});

test('it awards loyalty points from the discounted order subtotal', function (): void {
    LoyaltySetting::query()->create([
        'points_per_currency_unit' => 2,
        'currency_value_per_point' => 0.01,
        'is_active' => true,
    ]);

    $customer = createCustomer();
    $order = createOrder($customer, [
        'subtotal' => 100,
        'discount_amount' => 10,
        'total' => 90,
    ]);

    $transaction = app(LoyaltyService::class)->awardForOrder($order);
    $account = $customer->loyaltyAccount()->first();

    expect($transaction)->not->toBeNull()
        ->and($transaction?->type)->toBe('earn')
        ->and($account)->not->toBeNull()
        ->and((float) $account?->points_balance)->toBe(180.0)
        ->and((float) $order->fresh()->loyalty_points_earned)->toBe(180.0);
});
