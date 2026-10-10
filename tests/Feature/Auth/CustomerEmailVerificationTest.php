<?php

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('unverified customer login is authenticated but redirected to the email verification prompt', function () {
    $customer = Customer::factory()->unverified()->create([
        'email' => 'unverified@partyeden.test',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'unverified@partyeden.test',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($customer);
    $response->assertRedirect(route('verification.notice', absolute: false));
});

test('verified customer login redirects straight to the customer dashboard', function () {
    $customer = Customer::factory()->create([
        'email' => 'verified@partyeden.test',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'verified@partyeden.test',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($customer);
    $response->assertRedirect(route('customer.dashboard', absolute: false));
});

test('unverified customer accessing /customer is redirected to the email verification prompt', function () {
    $customer = Customer::factory()->unverified()->create();

    $response = $this->actingAs($customer)->get(route('customer.dashboard'));

    $response->assertRedirect(route('verification.notice', absolute: false));
});

test('verification.notice renders the verify-email page for an unverified customer', function () {
    $customer = Customer::factory()->unverified()->create();

    $response = $this->actingAs($customer)->get(route('verification.notice'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/verify-email')
    );
});
