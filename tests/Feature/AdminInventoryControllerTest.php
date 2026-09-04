<?php

use App\Models\InventoryBalance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access admin inventory', function () {
    $this->get(route('inventory.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin inventory', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->get(route('inventory.index'))
        ->assertForbidden();
});

test('admin can view inventory index', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    InventoryBalance::factory()->create();

    $this->actingAs($user)
        ->get(route('inventory.index'))
        ->assertOk();
});

test('admin can view the adjustment form', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $balance = InventoryBalance::factory()->create();

    $this->actingAs($user)
        ->get(route('inventory.adjust', $balance->id))
        ->assertOk();
});

test('admin can adjust an inventory balance', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $balance = InventoryBalance::factory()->create(['quantity' => 100]);

    $this->actingAs($user)
        ->post(route('inventory.adjust.store', $balance->id), [
            'quantity' => 42,
            'reason' => 'Stocktake correction',
        ])
        ->assertRedirect(route('inventory.index'));

    // Adjustment sets the quantity directly (not additive)
    expect((float) $balance->refresh()->quantity)->toBe(42.0);
});

test('inventory adjustment requires quantity and reason', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $balance = InventoryBalance::factory()->create(['quantity' => 100]);

    $this->actingAs($user)
        ->from(route('inventory.adjust', $balance->id))
        ->post(route('inventory.adjust.store', $balance->id), [])
        ->assertSessionHasErrors(['quantity', 'reason']);

    // Balance is untouched when validation fails
    expect((float) $balance->refresh()->quantity)->toBe(100.0);
});
