<?php

use App\Models\GiftCard;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access admin gift cards', function () {
    $this->get(route('gift-cards.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin gift cards', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->get(route('gift-cards.index'))
        ->assertForbidden();
});

test('admin can view gift cards index and create form', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    GiftCard::factory()->create();

    $this->actingAs($user)->get(route('gift-cards.index'))->assertOk();
    $this->actingAs($user)->get(route('gift-cards.create'))->assertOk();
});

test('admin can issue a gift card with generated code and balance', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->post(route('gift-cards.store'), [
            'original_amount' => 50,
        ])
        ->assertRedirect(route('gift-cards.index'));

    // Code, balance and status are generated server-side
    $card = GiftCard::firstOrFail();
    expect($card->code)->toStartWith('GC-')
        ->and((float) $card->current_balance)->toBe(50.0)
        ->and($card->status)->toBe('active')
        ->and($card->issued_by)->toBe($user->id)
        ->and($card->issued_at)->not->toBeNull();
});

test('gift card creation requires a positive amount', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->from(route('gift-cards.create'))
        ->post(route('gift-cards.store'), ['original_amount' => 0])
        ->assertSessionHasErrors('original_amount');

    $this->assertDatabaseCount('gift_cards', 0);
});

test('admin can cancel a gift card', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $card = GiftCard::factory()->create(['status' => 'active']);

    $this->actingAs($user)
        ->put(route('gift-cards.update', $card->id), ['status' => 'cancelled'])
        ->assertRedirect(route('gift-cards.index'));

    expect($card->refresh()->status)->toBe('cancelled');
});

test('admin can delete a gift card', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $card = GiftCard::factory()->create();

    $this->actingAs($user)
        ->delete(route('gift-cards.destroy', $card->id))
        ->assertRedirect(route('gift-cards.index'));

    // Gift cards are soft deleted
    $this->assertSoftDeleted('gift_cards', ['id' => $card->id]);
});
