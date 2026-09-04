<?php

use App\Models\Location;
use App\Models\Product;
use App\Models\ReturnedItem;
use App\Models\ReturnModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access admin returns', function () {
    $this->get(route('returns.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin returns', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->get(route('returns.index'))
        ->assertForbidden();
});

test('admin can view returns index and detail', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $return = ReturnModel::factory()->create();

    $this->actingAs($user)->get(route('returns.index'))->assertOk();
    $this->actingAs($user)->get(route('returns.show', $return->id))->assertOk();
});

test('admin can approve a pending return and it stamps processed fields', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $return = ReturnModel::factory()->create(['status' => 'pending']);

    $this->actingAs($user)
        ->from(route('returns.show', $return->id))
        ->patch(route('returns.status.update', $return->id), ['status' => 'approved'])
        ->assertRedirect(route('returns.show', $return->id));

    $return->refresh();
    expect($return->status)->toBe('approved')
        ->and($return->processed_by)->toBe($user->id)
        ->and($return->processed_at)->not->toBeNull();
});

test('invalid status transitions are rejected', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    // pending can only move to approved/rejected — refunded is not allowed
    $return = ReturnModel::factory()->create(['status' => 'pending']);

    $this->actingAs($user)
        ->from(route('returns.show', $return->id))
        ->patch(route('returns.status.update', $return->id), ['status' => 'refunded'])
        ->assertSessionHasErrors('status');

    expect($return->refresh()->status)->toBe('pending');
});

test('restock creates inventory movements for tracked products', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $location = Location::factory()->create();
    $return = ReturnModel::factory()->create(['status' => 'received']);

    // One tracked and one untracked product on the return
    $tracked = Product::factory()->create(['track_inventory' => true]);
    $untracked = Product::factory()->create(['track_inventory' => false]);
    ReturnedItem::factory()->create(['return_id' => $return->id, 'product_id' => $tracked->id, 'quantity' => 3]);
    ReturnedItem::factory()->create(['return_id' => $return->id, 'product_id' => $untracked->id, 'quantity' => 2]);

    $this->actingAs($user)
        ->from(route('returns.show', $return->id))
        ->post(route('returns.restock', $return->id), ['location_id' => $location->id])
        ->assertRedirect(route('returns.show', $return->id));

    // Only the tracked product gets a stock-in movement
    $this->assertDatabaseHas('inventory_movements', [
        'product_id' => $tracked->id,
        'location_id' => $location->id,
        'quantity' => 3,
        'type' => 'return',
        'reference_id' => $return->id,
    ]);
    $this->assertDatabaseMissing('inventory_movements', [
        'product_id' => $untracked->id,
    ]);
});

test('restock is blocked unless the return is received', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $location = Location::factory()->create();
    $return = ReturnModel::factory()->create(['status' => 'pending']);

    $this->actingAs($user)
        ->from(route('returns.show', $return->id))
        ->post(route('returns.restock', $return->id), ['location_id' => $location->id])
        ->assertRedirect(route('returns.show', $return->id))
        ->assertSessionHas('error');

    $this->assertDatabaseCount('inventory_movements', 0);
});
