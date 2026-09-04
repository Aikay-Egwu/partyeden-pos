<?php

use App\Models\Location;
use App\Models\Product;
use App\Models\ReturnedItem;
use App\Models\ReturnModel;
use App\Models\Staff;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store creates a pending return with a generated number', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $transaction = Transaction::factory()->create();
    $staff = Staff::factory()->create();
    $location = Location::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/returns', [
            'transaction_id' => $transaction->id,
            'staff_id' => $staff->id,
            'location_id' => $location->id,
            'reason' => 'Damaged goods',
            'total_refund' => 12.50,
        ])
        ->assertCreated();

    $return = ReturnModel::findOrFail($response->json('data.id'));
    expect($return->return_number)->toStartWith('RET-');
    expect($return->status)->toBe('pending');

    $this->assertDatabaseHas('returns', [
        'id' => $return->id,
        'transaction_id' => $transaction->id,
        'reason' => 'Damaged goods',
    ]);
});

test('store validates required fields', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->postJson('/api/v1/returns', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['transaction_id', 'staff_id', 'location_id']);

    $this->assertDatabaseCount('returns', 0);
});

test('users without the manage returns permission cannot create returns', function () {
    $user = User::factory()->create(['permissions' => []]);
    $transaction = Transaction::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/returns', [
            'transaction_id' => $transaction->id,
            'staff_id' => $transaction->staff_id,
            'location_id' => $transaction->location_id,
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('returns', 0);
});

test('approve and complete stamp the processing user and timestamp', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $return = ReturnModel::factory()->create();

    $this->actingAs($user)
        ->postJson("/api/v1/returns/{$return->id}/approve")
        ->assertOk();

    $return->refresh();
    expect($return->status)->toBe('approved');
    expect($return->processed_by)->toBe($user->id);
    expect($return->processed_at)->not->toBeNull();

    $this->actingAs($user)
        ->postJson("/api/v1/returns/{$return->id}/complete")
        ->assertOk();

    expect($return->refresh()->status)->toBe('completed');
});

test('reject records the reason in the notes', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $return = ReturnModel::factory()->create(['notes' => 'Customer called']);

    $this->actingAs($user)
        ->postJson("/api/v1/returns/{$return->id}/reject", ['reason' => 'Outside return window'])
        ->assertOk();

    $return->refresh();
    expect($return->status)->toBe('rejected');
    expect($return->notes)->toBe("Customer called\n\nREJECTED: Outside return window");
});

test('returned items can be added to and removed from a return', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $return = ReturnModel::factory()->create();
    $product = Product::factory()->create();

    // Add an item to the return
    $response = $this->actingAs($user)
        ->postJson("/api/v1/returns/{$return->id}/items", [
            'product_id' => $product->id,
            'quantity' => 1,
            'refund_amount' => 9.99,
            'condition' => 'good',
            'disposition' => 'return_to_stock',
        ])
        ->assertCreated();

    $itemId = $response->json('data.id');
    $this->assertDatabaseHas('returned_items', [
        'id' => $itemId,
        'return_id' => $return->id,
        'product_id' => $product->id,
        'refund_amount' => 9.99,
    ]);

    // Remove it again (soft delete)
    $this->actingAs($user)
        ->deleteJson("/api/v1/returned-items/{$itemId}")
        ->assertOk();

    expect(ReturnedItem::find($itemId))->toBeNull();
});

test('returned item store validates condition and disposition', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $return = ReturnModel::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)
        ->postJson("/api/v1/returns/{$return->id}/items", [
            'product_id' => $product->id,
            'quantity' => 1,
            'refund_amount' => 5,
            'condition' => 'invalid',
            'disposition' => 'invalid',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['condition', 'disposition']);

    $this->assertDatabaseCount('returned_items', 0);
});
