<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use App\Models\LoyaltyAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it returns matching delivery zone details for a postcode lookup', function (): void {
    $zone = DeliveryZone::query()->create([
        'name' => 'Central Delivery',
        'delivery_price' => 7.50,
        'min_order_amount' => 15.00,
        'is_active' => true,
    ]);

    DeliveryZonePostcodePrefix::query()->create([
        'delivery_zone_id' => $zone->id,
        'code_prefix' => 'SW1A',
        'is_active' => true,
    ]);

    $this->getJson(route('store.checkout.delivery-zone', [
        'postcode' => 'SW1A 1AA',
    ]))
        ->assertOk()
        ->assertJson([
            'zone' => [
                'id' => $zone->id,
                'name' => 'Central Delivery',
                'delivery_price' => '7.5',
                'min_order_amount' => '15',
            ],
            'message' => null,
        ]);
});

test('it returns an outside delivery zone message for an unmatched postcode lookup', function (): void {
    $this->getJson(route('store.checkout.delivery-zone', [
        'postcode' => 'ZZ1 1ZZ',
    ]))
        ->assertOk()
        ->assertJson([
            'zone' => null,
            'message' => 'Outside delivery zone.',
        ]);
});

test('loyalty lookup never exposes the customer name', function (): void {
    $customer = Customer::query()->create([
        'first_name' => 'Chioma',
        'last_name' => 'Eden',
        'email' => 'chioma@example.com',
        'is_active' => true,
    ]);

    LoyaltyAccount::query()->create([
        'customer_id' => $customer->id,
        'points_balance' => 120,
        'total_points_earned' => 150,
        'total_points_redeemed' => 30,
        'is_active' => true,
    ]);

    $response = $this->getJson(route('store.checkout.loyalty-account', [
        'email' => 'chioma@example.com',
    ]));

    $response->assertOk()
        ->assertJsonPath('account.points_balance', fn ($value) => $value !== null)
        // PII must never leak from this unauthenticated endpoint
        ->assertJsonMissingPath('account.customer_name');

    expect($response->json('account'))->not->toHaveKey('customer_name');
});
