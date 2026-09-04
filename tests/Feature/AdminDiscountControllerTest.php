<?php

use App\Models\Discount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access admin discounts', function () {
    $this->get(route('discounts.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin discounts', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->get(route('discounts.index'))
        ->assertForbidden();
});

test('admin can view discounts index and create form', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Discount::factory()->create();

    $this->actingAs($user)->get(route('discounts.index'))->assertOk();
    $this->actingAs($user)->get(route('discounts.create'))->assertOk();
});

test('admin can create a discount', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->post(route('discounts.store'), [
            'name' => 'Summer Sale',
            'code' => 'SUMMER10',
            'type' => 'percentage',
            'value' => 10,
        ])
        ->assertRedirect(route('discounts.index'));

    $this->assertDatabaseHas('discounts', [
        'code' => 'SUMMER10',
        'type' => 'percentage',
    ]);
});

test('discount creation validates required fields and duplicate code', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Discount::factory()->create(['code' => 'DUPLICATE']);

    $this->actingAs($user)
        ->from(route('discounts.create'))
        ->post(route('discounts.store'), [
            'name' => 'Dupe',
            'code' => 'DUPLICATE',
            'type' => 'invalid-type',
        ])
        ->assertSessionHasErrors(['code', 'type', 'value']);

    // Only the original discount exists
    expect(Discount::count())->toBe(1);
});

test('admin can update a discount', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $discount = Discount::factory()->create(['value' => 10]);

    $this->actingAs($user)
        ->put(route('discounts.update', $discount->id), [
            'name' => $discount->name,
            'code' => $discount->code,
            'type' => 'fixed',
            'value' => 5,
        ])
        ->assertRedirect(route('discounts.index'));

    $discount->refresh();
    expect($discount->type)->toBe('fixed')
        ->and((float) $discount->value)->toBe(5.0);
});

test('admin can delete a discount', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $discount = Discount::factory()->create();

    $this->actingAs($user)
        ->delete(route('discounts.destroy', $discount->id))
        ->assertRedirect(route('discounts.index'));

    // Discounts are soft deleted
    $this->assertSoftDeleted('discounts', ['id' => $discount->id]);
});
