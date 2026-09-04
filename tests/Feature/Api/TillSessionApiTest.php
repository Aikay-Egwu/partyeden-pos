<?php

use App\Models\Location;
use App\Models\Staff;
use App\Models\TillSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('open creates a till session with an open status', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $staff = Staff::factory()->create();
    $location = Location::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/till-sessions/open', [
            'staff_id' => $staff->id,
            'location_id' => $location->id,
            'opening_balance' => 150.00,
        ])
        ->assertCreated();

    $this->assertDatabaseHas('till_sessions', [
        'id' => $response->json('data.id'),
        'staff_id' => $staff->id,
        'location_id' => $location->id,
        'opening_balance' => 150.00,
        'cash_sales' => 0,
        'status' => 'open',
    ]);
});

test('open validates required fields', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->postJson('/api/v1/till-sessions/open', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['staff_id', 'location_id', 'opening_balance']);

    $this->assertDatabaseCount('till_sessions', 0);
});

test('users without the process sales permission cannot open a session', function () {
    $user = User::factory()->create(['permissions' => []]);
    $staff = Staff::factory()->create();
    $location = Location::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/till-sessions/open', [
            'staff_id' => $staff->id,
            'location_id' => $location->id,
            'opening_balance' => 100,
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('till_sessions', 0);
});

test('close records balances and marks the session closed', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $session = TillSession::factory()->create([
        'opening_balance' => 100.00,
        'cash_sales' => 55.50,
    ]);

    $this->actingAs($user)
        ->postJson("/api/v1/till-sessions/{$session->id}/close", [
            'closing_balance' => 150.00,
            'notes' => 'End of shift',
        ])
        ->assertOk();

    $session->refresh();
    expect($session->status)->toBe('closed');
    expect($session->closed_at)->not->toBeNull();
    expect((float) $session->closing_balance)->toBe(150.00);
    // Expected balance = opening balance + cash sales
    expect((float) $session->expected_balance)->toBe(155.50);
    expect($session->notes)->toBe('End of shift');
});

test('close requires a closing balance', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $session = TillSession::factory()->create();

    $this->actingAs($user)
        ->postJson("/api/v1/till-sessions/{$session->id}/close", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['closing_balance']);

    expect($session->refresh()->status)->toBe('open');
});

test('current returns the open session for a staff member', function () {
    $user = User::factory()->create(['permissions' => []]);
    $staff = Staff::factory()->create();
    TillSession::factory()->closed()->create(['staff_id' => $staff->id]);
    $open = TillSession::factory()->create(['staff_id' => $staff->id]);

    $this->actingAs($user)
        ->getJson("/api/v1/till-sessions-current?staff_id={$staff->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $open->id);
});

test('current returns 404 when the staff member has no open session', function () {
    $user = User::factory()->create(['permissions' => []]);
    $staff = Staff::factory()->create();

    $this->actingAs($user)
        ->getJson("/api/v1/till-sessions-current?staff_id={$staff->id}")
        ->assertNotFound();
});
