<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access admin customers', function () {
    $this->get(route('customers.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin customers', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->get(route('customers.index'))
        ->assertForbidden();
});

test('admin can view customers index and create form', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Customer::factory()->create();

    $this->actingAs($user)->get(route('customers.index'))->assertOk();
    $this->actingAs($user)->get(route('customers.create'))->assertOk();
});

test('admin can create a customer', function () {
    $user = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($user)
        ->post(route('customers.store'), [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
        ])
        ->assertRedirect(route('customers.index'));

    $this->assertDatabaseHas('customers', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@example.com',
    ]);
});

test('customer creation rejects a duplicate email', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    Customer::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs($user)
        ->from(route('customers.create'))
        ->post(route('customers.store'), [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'taken@example.com',
        ])
        ->assertSessionHasErrors('email');

    expect(Customer::count())->toBe(1);
});

test('admin can update a customer', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $customer = Customer::factory()->create(['first_name' => 'Old']);

    $this->actingAs($user)
        ->put(route('customers.update', $customer->id), [
            'first_name' => 'New',
        ])
        ->assertRedirect(route('customers.index'));

    expect($customer->refresh()->first_name)->toBe('New');
});

test('admin can delete a customer', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $customer = Customer::factory()->create();

    $this->actingAs($user)
        ->delete(route('customers.destroy', $customer->id))
        ->assertRedirect(route('customers.index'));

    // Customers are soft deleted
    $this->assertSoftDeleted('customers', ['id' => $customer->id]);
});
