<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('actingAs Customer → GET /customer → 200, Inertia page customer/home with correct props', function () {
    $customer = Customer::factory()->create([
        'first_name' => 'Adaeze',
        'last_name' => 'Nwankwo',
        'email' => 'adaeze@partyeden.test',
    ]);

    $response = $this->actingAs($customer)->get(route('customer.dashboard'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('customer/home')
        ->has('customer', fn (Assert $customerAssert) => $customerAssert
            ->where('first_name', 'Adaeze')
            ->where('last_name', 'Nwankwo')
            ->where('email', 'adaeze@partyeden.test')
            ->etc()
        )
        ->has('orders')
        ->has('loyaltyPoints')
        ->has('quickLinks')
    );

    $props = $response->viewData('page')['props'];
    expect(is_array($props['orders']))->toBeTrue();
    expect(is_countable($props['orders']))->toBeTrue();
    expect(is_int($props['loyaltyPoints']) || is_numeric($props['loyaltyPoints']))->toBeTrue();

    foreach ($props['orders'] as $order) {
        expect(is_array($order))->toBeTrue();
        expect(array_key_exists('id', $order))->toBeTrue();
        expect(array_key_exists('total', $order))->toBeTrue();
        expect(array_key_exists('status', $order))->toBeTrue();
        expect(array_key_exists('created_at', $order))->toBeTrue();
    }
});

test('guest GET /customer → 302 redirect to /login', function () {
    $response = $this->get(route('customer.dashboard'));

    $response->assertRedirect(route('login'));
});

test('admin User GET /customer → 302 redirect to /admin', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('customer.dashboard'));

    $response->assertRedirect(route('admin.dashboard'));
});
