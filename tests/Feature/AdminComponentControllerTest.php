<?php

use App\Models\Component;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can access components index', function () {
    $user = User::factory()->create(['permissions' => ['*']]);
    $this->actingAs($user);
    $this->get(route('components.index'))->assertOk();
});

test('admin can create component', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $this->post(route('components.store'), [
        'name' => 'Latex Balloon',
        'sku' => 'LATEX-123',
        'cost_price' => 0.50,
        'stock_quantity' => 100,
    ])->assertRedirect(route('components.index'));

    $this->assertDatabaseHas('components', [
        'sku' => 'LATEX-123',
    ]);
});

test('admin can update component', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $component = Component::factory()->create(['name' => 'Old Name']);

    $this->put(route('components.update', $component), [
        'name' => 'New Name',
        'sku' => $component->sku,
    ])->assertRedirect(route('components.index'));

    $this->assertDatabaseHas('components', [
        'id' => $component->id,
        'name' => 'New Name',
    ]);
});

test('admin can delete component', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $component = Component::factory()->create();

    $this->delete(route('components.destroy', $component))
        ->assertRedirect(route('components.index'));

    $this->assertSoftDeleted('components', [
        'id' => $component->id,
    ]);
});
