<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('guests cannot access admin users', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access admin users', function () {
    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)
        ->get(route('users.index'))
        ->assertForbidden();
});

test('admin can view users index and create form', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    User::factory()->create();

    $this->actingAs($admin)->get(route('users.index'))->assertOk();
    $this->actingAs($admin)->get(route('users.create'))->assertOk();
});

test('admin can create a user as administrator', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Jane Manager',
            'email' => 'jane@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'is_admin' => true,
        ])
        ->assertRedirect(route('users.index'));

    $created = User::where('email', 'jane@example.com')->firstOrFail();
    expect($created->hasPermission('admin'))->toBeTrue()
        ->and(Hash::check('secret123', $created->password))->toBeTrue();
});

test('admin can create a non-administrator user', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Basic User',
            'email' => 'basic@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'is_admin' => false,
        ])
        ->assertRedirect(route('users.index'));

    expect(User::where('email', 'basic@example.com')->firstOrFail()->hasPermission('admin'))->toBeFalse();
});

test('user creation validates required fields, duplicate email and password confirmation', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    User::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs($admin)
        ->from(route('users.create'))
        ->post(route('users.store'), [
            'name' => '',
            'email' => 'taken@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'mismatch',
        ])
        ->assertSessionHasErrors(['name', 'email', 'password']);
});

test('admin can update a user and toggle administrator', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    $target = User::factory()->create(['permissions' => []]);

    $this->actingAs($admin)
        ->put(route('users.update', $target->id), [
            'name' => 'Renamed',
            'email' => $target->email,
            'is_admin' => true,
        ])
        ->assertRedirect(route('users.index'));

    $target->refresh();
    expect($target->name)->toBe('Renamed')
        ->and($target->hasPermission('admin'))->toBeTrue();
});

test('leaving password blank on update preserves the existing password', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    $target = User::factory()->create(['password' => 'original123']);
    $originalHash = $target->password;

    $this->actingAs($admin)
        ->put(route('users.update', $target->id), [
            'name' => $target->name,
            'email' => $target->email,
            'password' => '',
            'password_confirmation' => '',
            'is_admin' => false,
        ])
        ->assertRedirect(route('users.index'));

    $target->refresh();
    expect($target->password)->toBe($originalHash)
        ->and(Hash::check('original123', $target->password))->toBeTrue();
});

test('updating with a new password changes it', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    $target = User::factory()->create(['password' => 'original123']);

    $this->actingAs($admin)
        ->put(route('users.update', $target->id), [
            'name' => $target->name,
            'email' => $target->email,
            'password' => 'brandnew123',
            'password_confirmation' => 'brandnew123',
        ])
        ->assertRedirect(route('users.index'));

    $target->refresh();
    expect(Hash::check('brandnew123', $target->password))->toBeTrue();
});

test('admin can delete another user', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);
    $target = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('users.destroy', $target->id))
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('admin cannot delete their own account', function () {
    $admin = User::factory()->create(['permissions' => ['*']]);

    $this->actingAs($admin)
        ->delete(route('users.destroy', $admin->id))
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
