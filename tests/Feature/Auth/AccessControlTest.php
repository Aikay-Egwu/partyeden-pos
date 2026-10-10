<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

test('actingAs User factory → GET /customer → 302 redirects to /admin', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/customer');

    $response->assertRedirect(route('admin.dashboard'));
});

test('actingAs User factory → GET /login → 302 redirects to /admin', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('login'));

    $response->assertRedirect(route('admin.dashboard'));
});

test('actingAs Customer factory → GET /admin → 302 redirects to /customer', function () {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($customer)->get('/admin');

    $response->assertRedirect(route('customer.dashboard'));
});

test('actingAs Customer → GET /login → 302 redirects to /customer', function () {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($customer)->get(route('login'));

    $response->assertRedirect(route('customer.dashboard'));
});

test('guest GET /admin → 302 to /login with intended preserved, then POST login as admin returns to /admin', function () {
    $user = User::factory()->create([
        'email' => 'intended-admin@test.com',
    ]);

    Auth::logout();
    $this->assertGuest();

    $guestResponse = $this->get('/admin');
    $guestResponse->assertRedirect(route('login'));

    $loginResponse = $this->post(route('login.store'), [
        'email' => 'intended-admin@test.com',
        'password' => 'password',
    ]);

    $loginResponse->assertRedirect('/admin');
});

test('guest GET /customer → 302 to /login with intended preserved, then POST login as customer returns to /customer', function () {
    $customer = Customer::factory()->create([
        'email' => 'intended-customer@test.com',
    ]);

    Auth::logout();
    $this->assertGuest();

    $guestResponse = $this->get('/customer');
    $guestResponse->assertRedirect(route('login'));

    $loginResponse = $this->post(route('login.store'), [
        'email' => 'intended-customer@test.com',
        'password' => 'password',
    ]);

    $loginResponse->assertRedirect('/customer');
});
