<?php

use App\Models\GiftCard;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store issues a gift card and logs a purchase transaction', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $response = $this->actingAs($user)
        ->postJson('/api/v1/gift-cards', [
            'original_amount' => 50.00,
            'recipient_name' => 'Jane Doe',
        ])
        ->assertCreated();

    $giftCard = GiftCard::findOrFail($response->json('data.id'));
    expect($giftCard->code)->toStartWith('GC-');
    expect($giftCard->status)->toBe('active');
    expect((float) $giftCard->current_balance)->toBe(50.00);
    expect($giftCard->issued_by)->toBe($user->id);

    // Purchase transaction logged against the card
    $this->assertDatabaseHas('gift_card_transactions', [
        'gift_card_id' => $giftCard->id,
        'type' => 'purchase',
        'amount' => 50.00,
        'balance_after' => 50.00,
    ]);
});

test('store requires a positive original amount', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->postJson('/api/v1/gift-cards', ['original_amount' => 0])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['original_amount']);

    $this->assertDatabaseCount('gift_cards', 0);
});

test('users without the manage gift cards permission cannot issue cards', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->postJson('/api/v1/gift-cards', ['original_amount' => 25.00])
        ->assertForbidden();

    $this->assertDatabaseCount('gift_cards', 0);
});

test('adjust balance updates the card and logs the adjustment', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $giftCard = GiftCard::factory()->create([
        'original_amount' => 100.00,
        'current_balance' => 100.00,
    ]);

    // Positive adjustment is logged as a refund
    $this->actingAs($user)
        ->postJson("/api/v1/gift-cards/{$giftCard->id}/adjust-balance", [
            'amount' => 10.00,
            'description' => 'Goodwill credit',
        ])
        ->assertOk();

    expect((float) $giftCard->refresh()->current_balance)->toBe(110.00);
    $this->assertDatabaseHas('gift_card_transactions', [
        'gift_card_id' => $giftCard->id,
        'type' => 'refund',
        'amount' => 10.00,
        'balance_after' => 110.00,
        'description' => 'Goodwill credit',
    ]);

    // Negative adjustment is logged as an adjustment
    $this->actingAs($user)
        ->postJson("/api/v1/gift-cards/{$giftCard->id}/adjust-balance", [
            'amount' => -30.00,
        ])
        ->assertOk();

    expect((float) $giftCard->refresh()->current_balance)->toBe(80.00);
    $this->assertDatabaseHas('gift_card_transactions', [
        'gift_card_id' => $giftCard->id,
        'type' => 'adjustment',
        'amount' => -30.00,
        'balance_after' => 80.00,
    ]);
});

test('adjust balance requires an amount', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $giftCard = GiftCard::factory()->create(['current_balance' => 40.00]);

    $this->actingAs($user)
        ->postJson("/api/v1/gift-cards/{$giftCard->id}/adjust-balance", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);

    expect((float) $giftCard->refresh()->current_balance)->toBe(40.00);
});

test('destroy cancels the gift card instead of deleting it', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $giftCard = GiftCard::factory()->create();

    $this->actingAs($user)
        ->deleteJson("/api/v1/gift-cards/{$giftCard->id}")
        ->assertOk();

    // Row still exists — only the status changes
    $this->assertDatabaseHas('gift_cards', [
        'id' => $giftCard->id,
        'status' => 'cancelled',
    ]);
});
