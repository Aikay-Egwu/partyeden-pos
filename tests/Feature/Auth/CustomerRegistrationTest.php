<?php

use App\Models\Customer;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->validPayload = [
        'first_name' => 'Chioma',
        'last_name' => 'Okoro',
        'email' => 'chioma@partyeden.test',
        'password' => 'PartyEden123!',
        'password_confirmation' => 'PartyEden123!',
    ];
});

test('POST /register with valid payload creates Customer row, hashes password, leaves users table untouched, 302 to login with status flash', function () {
    Notification::fake();

    $usersBefore = DB::table('users')->count();
    $customersBefore = DB::table('customers')->count();

    $response = $this->post(route('register.store'), $this->validPayload);

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('status', __('Registration successful! Please check your email to verify your email address.'));

    expect(DB::table('customers')->count())->toBe($customersBefore + 1);
    expect(DB::table('users')->count())->toBe($usersBefore);

    $customer = Customer::query()
        ->where('email', 'chioma@partyeden.test')
        ->firstOrFail();

    expect($customer->first_name)->toBe('Chioma');
    expect($customer->last_name)->toBe('Okoro');
    expect(Hash::check('PartyEden123!', $customer->password))->toBeTrue();
    expect($customer->is_active)->toBeTrue();
    expect($customer->email_verified_at)->toBeNull();

    // A verification email must be dispatched to the newly registered customer.
    Notification::assertSentTo($customer, VerifyEmail::class);
});

dataset('missing_required_fields', [
    'missing first_name' => [['first_name' => ''], ['first_name']],
    'missing last_name' => [['last_name' => ''], ['last_name']],
    'missing email' => [['email' => ''], ['email']],
    'missing password' => [['password' => '', 'password_confirmation' => ''], ['password']],
    'missing password_confirmation' => [['password_confirmation' => ''], ['password']],
]);

test('POST /register with missing required field returns session error for that field and creates no row', function (array $overrides, array $expectedErrorFields) {
    $payload = array_merge($this->validPayload, $overrides);
    $customersBefore = DB::table('customers')->count();
    $usersBefore = DB::table('users')->count();

    $response = $this->post(route('register.store'), $payload);

    $response->assertSessionHasErrors($expectedErrorFields);
    expect(DB::table('customers')->count())->toBe($customersBefore);
    expect(DB::table('users')->count())->toBe($usersBefore);
})->with('missing_required_fields');

test('POST /register with duplicate email returns email uniqueness error and creates no row', function () {
    Customer::factory()->create(['email' => 'chioma@partyeden.test']);
    $customersBefore = DB::table('customers')->count();

    $response = $this->post(route('register.store'), $this->validPayload);

    $response->assertSessionHasErrors(['email']);
    expect(DB::table('customers')->count())->toBe($customersBefore);
});

test('POST /register with mismatched password confirmation returns password confirmation error', function () {
    $payload = array_merge($this->validPayload, [
        'password' => 'PartyEden123!',
        'password_confirmation' => 'DifferentPassword456!',
    ]);
    $customersBefore = DB::table('customers')->count();

    $response = $this->post(route('register.store'), $payload);

    $response->assertSessionHasErrors(['password']);
    expect(DB::table('customers')->count())->toBe($customersBefore);
});

test('POST /register with weak password (short length) fails Password::default() validation', function () {
    $weak = str_repeat('a', 3);
    $payload = array_merge($this->validPayload, [
        'password' => $weak,
        'password_confirmation' => $weak,
    ]);
    $customersBefore = DB::table('customers')->count();

    $response = $this->post(route('register.store'), $payload);

    $response->assertSessionHasErrors(['password']);
    expect(DB::table('customers')->count())->toBe($customersBefore);

    $errors = session('errors')->getBag('default')->get('password');
    expect($errors)->not->toBeEmpty();
});

test('AC-1 guard: POST /register with legacy Fortify admin shape FAILS required customer fields and NEVER writes users table', function () {
    $adminShape = [
        'name' => 'Test Admin',
        'email' => 'legacy-admin@partyeden.test',
        'password' => 'PartyEden123!',
        'password_confirmation' => 'PartyEden123!',
    ];

    $usersBefore = DB::table('users')->count();
    $customersBefore = DB::table('customers')->count();

    $response = $this->post(route('register.store'), $adminShape);

    $response->assertSessionHasErrors(['first_name', 'last_name']);
    expect(DB::table('users')->count())->toBe($usersBefore);
    expect(DB::table('customers')->count())->toBe($customersBefore);
});
