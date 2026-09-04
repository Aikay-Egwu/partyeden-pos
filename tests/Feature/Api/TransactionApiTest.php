<?php

use App\Models\Location;
use App\Models\Product;
use App\Models\Staff;
use App\Models\TillSession;
use App\Models\Transaction;
use App\Models\TransactionPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Build a valid payload for POST /api/v1/transactions.
 *
 * @return array<string, mixed>
 */
function validTransactionPayload(): array
{
    $staff = Staff::factory()->create();
    $location = Location::factory()->create();
    $session = TillSession::factory()->create([
        'staff_id' => $staff->id,
        'location_id' => $location->id,
    ]);
    $product = Product::factory()->create();

    return [
        'till_session_id' => $session->id,
        'staff_id' => $staff->id,
        'location_id' => $location->id,
        'subtotal' => 20.00,
        'tax_amount' => 4.00,
        'total' => 24.00,
        'items' => [
            [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => 2,
                'unit_price' => 10.00,
                'total' => 20.00,
            ],
        ],
        'payments' => [
            [
                'payment_method' => 'cash',
                'amount' => 24.00,
            ],
        ],
    ];
}

test('guests are redirected to login', function () {
    $this->getJson('/api/v1/transactions')->assertRedirect(route('login'));
});

test('authenticated users can list transactions', function () {
    $user = User::factory()->create(['permissions' => []]);
    Transaction::factory()->count(2)->create();

    $this->actingAs($user)
        ->getJson('/api/v1/transactions')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('store creates transaction with items and payments in the database', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $payload = validTransactionPayload();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/transactions', $payload)
        ->assertCreated();

    $transactionId = $response->json('data.id');

    // Transaction row persisted with generated number + completed status
    $transaction = Transaction::findOrFail($transactionId);
    expect($transaction->transaction_number)->toStartWith('TXN-');
    expect($transaction->status)->toBe('completed');

    $this->assertDatabaseHas('transactions', [
        'id' => $transactionId,
        'staff_id' => $payload['staff_id'],
        'total' => 24.00,
    ]);

    // Line items persisted
    $this->assertDatabaseHas('transaction_items', [
        'transaction_id' => $transactionId,
        'product_id' => $payload['items'][0]['product_id'],
        'quantity' => 2,
    ]);

    // Payment persisted and forced to completed
    $this->assertDatabaseHas('transaction_payments', [
        'transaction_id' => $transactionId,
        'payment_method' => 'cash',
        'status' => 'completed',
    ]);
});

test('store rejects payloads missing items and payments', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $payload = validTransactionPayload();
    unset($payload['items'], $payload['payments']);

    $this->actingAs($user)
        ->postJson('/api/v1/transactions', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['items', 'payments']);

    $this->assertDatabaseCount('transactions', 0);
});

test('users without the process sales permission cannot create transactions', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->postJson('/api/v1/transactions', validTransactionPayload())
        ->assertForbidden();

    $this->assertDatabaseCount('transactions', 0);
});

test('void marks the transaction voided and records the reason', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $transaction = Transaction::factory()->create(['notes' => 'Original note']);

    $this->actingAs($user)
        ->postJson("/api/v1/transactions/{$transaction->id}/void", ['reason' => 'Wrong items'])
        ->assertOk();

    $transaction->refresh();
    expect($transaction->status)->toBe('voided');
    expect($transaction->notes)->toBe("Original note\n\nVOIDED: Wrong items");
});

test('void requires a reason and the manage transactions permission', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    $cashier = User::factory()->create(['permissions' => ['process sales']]);
    $transaction = Transaction::factory()->create();

    // Missing reason → validation error
    $this->actingAs($admin)
        ->postJson("/api/v1/transactions/{$transaction->id}/void", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['reason']);

    // Cashier without 'manage transactions' → forbidden
    $this->actingAs($cashier)
        ->postJson("/api/v1/transactions/{$transaction->id}/void", ['reason' => 'Oops'])
        ->assertForbidden();

    expect($transaction->refresh()->status)->toBe('completed');
});

test('daily summary aggregates completed transactions only', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Transaction::factory()->create(['total' => 10, 'subtotal' => 10, 'status' => 'completed']);
    Transaction::factory()->create(['total' => 15, 'subtotal' => 15, 'status' => 'completed']);
    Transaction::factory()->create(['total' => 99, 'subtotal' => 99, 'status' => 'voided']);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/transactions-summary?period=daily')
        ->assertOk()
        ->assertJsonPath('period', 'daily');

    // Voided transaction excluded from today's bucket
    expect((float) $response->json('data.0.total_sales'))->toBe(25.0);
    expect($response->json('data.0.transaction_count'))->toBe(2);
});

test('payments for a transaction can be listed', function () {
    $user = User::factory()->create(['permissions' => []]);
    $transaction = Transaction::factory()->create();
    $payment = TransactionPayment::factory()->create(['transaction_id' => $transaction->id]);
    TransactionPayment::factory()->create(); // belongs to another transaction

    $this->actingAs($user)
        ->getJson("/api/v1/transactions/{$transaction->id}/payments")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $payment->id);
});
