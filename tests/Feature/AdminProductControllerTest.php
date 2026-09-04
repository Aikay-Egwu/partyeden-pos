<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access admin products', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin products', function () {
    $user = User::factory()->create(['permissions' => []]);
    $this->actingAs($user);
    $this->get(route('products.index'))->assertForbidden();
});

test('admin can access products index', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $this->actingAs($user);
    $this->get(route('products.index'))->assertOk();
});

test('admin can create product', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $this->post(route('products.store'), [
        'name' => 'Test Product',
        'sku' => 'TEST-123',
        'product_type' => 'standard',
    ])->assertRedirect(route('products.index'));

    $this->assertDatabaseHas('products', [
        'sku' => 'TEST-123',
    ]);
});
