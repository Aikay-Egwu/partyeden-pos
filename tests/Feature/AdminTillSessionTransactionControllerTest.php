<?php

use App\Models\TillSession;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Till sessions and transactions are read-only in the admin panel (index + show).

test('guests cannot access admin till sessions or transactions', function () {
    $this->get(route('till-sessions.index'))->assertRedirect(route('login'));
    $this->get(route('transactions.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin till sessions or transactions', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)->get(route('till-sessions.index'))->assertForbidden();
    $this->actingAs($user)->get(route('transactions.index'))->assertForbidden();
});

test('admin can view till sessions index and detail', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $session = TillSession::factory()->create();

    $this->actingAs($user)->get(route('till-sessions.index'))->assertOk();
    $this->actingAs($user)->get(route('till-sessions.show', $session->id))->assertOk();
});

test('admin can view transactions index and detail', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $transaction = Transaction::factory()->create();

    $this->actingAs($user)->get(route('transactions.index'))->assertOk();
    $this->actingAs($user)->get(route('transactions.show', $transaction->id))->assertOk();
});

test('admin can filter transactions by status', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Transaction::factory()->create(['status' => 'completed']);

    $this->actingAs($user)
        ->get(route('transactions.index', ['status' => 'completed']))
        ->assertOk();
});
