<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\MessageBag;
use Illuminate\Support\Str;
use Illuminate\Support\ViewErrorBag;

uses(RefreshDatabase::class);

function expectedGenericErrorMessage(): string
{
    return __('These credentials do not match our records.');
}

function extractEmailError(mixed $errors): ?string
{
    if ($errors instanceof ViewErrorBag) {
        $bag = $errors->getBag('default');
        $messages = $bag->get('email');
    } elseif ($errors instanceof MessageBag) {
        $messages = $errors->get('email');
    } elseif (is_array($errors)) {
        $messages = $errors['email'] ?? [];
    } else {
        return null;
    }

    if (is_array($messages) && count($messages) > 0) {
        return (string) $messages[0];
    }

    return null;
}

test('admin correct credentials authenticates as User instance and redirects to /admin', function () {
    $user = User::factory()->create([
        'email' => 'admin-login@test.com',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'admin-login@test.com',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    expect(Auth::user())->toBeInstanceOf(User::class);
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('customer correct credentials authenticates as Customer (UUID) and redirects to /customer', function () {
    $customer = Customer::factory()->create([
        'email' => 'customer-login@test.com',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'customer-login@test.com',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($customer);
    $authUser = Auth::user();
    expect($authUser)->toBeInstanceOf(Customer::class);
    expect(strlen((string) $authUser->getAuthIdentifier()))->toBeGreaterThanOrEqual(36);
    $response->assertRedirect(route('customer.dashboard', absolute: false));
});

dataset('login_failure_modes', [
    'unknown email' => [
        ['email' => 'unknown@test.com', 'password' => 'password'],
        'setup' => null,
    ],
    'admin wrong password' => [
        ['email' => 'admin-wrong@test.com', 'password' => 'wrongpass'],
        'setup' => 'admin',
    ],
    'customer wrong password' => [
        ['email' => 'customer-wrong@test.com', 'password' => 'wrongpass'],
        'setup' => 'customer',
    ],
]);

test('all three login failure modes produce byte-identical error string and remain guest', function (array $credentials, ?string $setup) {
    if ($setup === 'admin') {
        User::factory()->create(['email' => $credentials['email']]);
    } elseif ($setup === 'customer') {
        Customer::factory()->create(['email' => $credentials['email']]);
    }

    $response = $this->post(route('login.store'), $credentials);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
    expect(Auth::guest())->toBeTrue();

    $error = extractEmailError(session('errors'));
    expect($error)->not->toBeNull();
    expect($error)->toBe(expectedGenericErrorMessage());
})->with('login_failure_modes');

test('all three failure modes produce EXACT triple-equal error strings', function () {
    User::factory()->create(['email' => 'admin@test.com']);
    Customer::factory()->create(['email' => 'customer@test.com']);

    $respA = $this->post(route('login.store'), ['email' => 'admin@test.com', 'password' => 'wrong']);
    $respA->assertSessionHasErrors('email');
    $errorA = extractEmailError(session('errors'));

    $respB = $this->post(route('login.store'), ['email' => 'customer@test.com', 'password' => 'wrong']);
    $respB->assertSessionHasErrors('email');
    $errorB = extractEmailError(session('errors'));

    $respC = $this->post(route('login.store'), ['email' => 'nobody@test.com', 'password' => 'wrong']);
    $respC->assertSessionHasErrors('email');
    $errorC = extractEmailError(session('errors'));

    expect($errorA)->not->toBeNull();
    expect($errorA === $errorB)->toBeTrue();
    expect($errorB === $errorC)->toBeTrue();
    expect($errorA === expectedGenericErrorMessage())->toBeTrue();
});

test('rate limiting returns 429 after 5 failed attempts using exact FortifyServiceProvider throttle key', function () {
    $throttledEmail = 'throttle-test@test.com';
    $ip = '127.0.0.1';
    User::factory()->create(['email' => $throttledEmail]);

    $expectedKey = Str::transliterate(Str::lower($throttledEmail).'|'.$ip);
    for ($i = 0; $i < 5; $i++) {
        $this->post(route('login.store'), [
            'email' => $throttledEmail,
            'password' => 'wrong-password',
        ]);
    }

    $response = $this->post(route('login.store'), [
        'email' => $throttledEmail,
        'password' => 'password',
    ]);

    $response->assertTooManyRequests();
    $response->assertStatus(429);
});
