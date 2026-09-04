<?php

use App\Models\InventoryBalance;
use App\Models\InventoryMovement;
use App\Models\StockReservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $this->getJson('/api/v1/inventory-balances')->assertRedirect(route('login'));
});

test('authenticated users can list inventory balances', function () {
    $user = User::factory()->create(['permissions' => []]);
    InventoryBalance::factory()->count(3)->create();

    $this->actingAs($user)
        ->getJson('/api/v1/inventory-balances')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('adjust updates the balance and logs an inventory movement', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $balance = InventoryBalance::factory()->create(['quantity' => 100]);

    $this->actingAs($user)
        ->postJson("/api/v1/inventory-balances/{$balance->id}/adjust", [
            'quantity' => -25,
            'reason' => 'Stock take correction',
        ])
        ->assertOk();

    expect((float) $balance->refresh()->quantity)->toBe(75.0);

    // Adjustment movement logged against the balance's location
    $this->assertDatabaseHas('inventory_movements', [
        'product_id' => $balance->product_id,
        'location_id' => $balance->location_id,
        'type' => 'adjustment',
        'quantity' => -25,
        'reason' => 'Stock take correction',
    ]);
});

test('adjust requires a numeric quantity', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $balance = InventoryBalance::factory()->create(['quantity' => 50]);

    $this->actingAs($user)
        ->postJson("/api/v1/inventory-balances/{$balance->id}/adjust", ['quantity' => 'lots'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['quantity']);

    expect((float) $balance->refresh()->quantity)->toBe(50.0);
    $this->assertDatabaseCount('inventory_movements', 0);
});

test('users without the manage inventory permission cannot adjust balances', function () {
    $user = User::factory()->create(['permissions' => []]);
    $balance = InventoryBalance::factory()->create(['quantity' => 10]);

    $this->actingAs($user)
        ->postJson("/api/v1/inventory-balances/{$balance->id}/adjust", ['quantity' => 5])
        ->assertForbidden();

    expect((float) $balance->refresh()->quantity)->toBe(10.0);
});

test('inventory movements can be listed', function () {
    $user = User::factory()->create(['permissions' => []]);
    InventoryMovement::factory()->count(2)->create();

    $this->actingAs($user)
        ->getJson('/api/v1/inventory-movements')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('release cancels a stock reservation', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $reservation = StockReservation::factory()->create();

    $this->actingAs($user)
        ->postJson("/api/v1/stock-reservations/{$reservation->id}/release")
        ->assertOk();

    $this->assertDatabaseHas('stock_reservations', [
        'id' => $reservation->id,
        'status' => 'cancelled',
    ]);
});

test('extend updates the reservation expiry and rejects past dates', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $reservation = StockReservation::factory()->create();
    $newExpiry = now()->addDays(3);

    $this->actingAs($user)
        ->postJson("/api/v1/stock-reservations/{$reservation->id}/extend", [
            'expires_at' => $newExpiry->toDateTimeString(),
        ])
        ->assertOk();

    expect($reservation->refresh()->expires_at->toDateTimeString())
        ->toBe($newExpiry->toDateTimeString());

    // A date in the past fails validation
    $this->actingAs($user)
        ->postJson("/api/v1/stock-reservations/{$reservation->id}/extend", [
            'expires_at' => now()->subDay()->toDateTimeString(),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['expires_at']);
});
