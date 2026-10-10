<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('admin User forgot password flow creates token row, resets password, and new password login works', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'admin-reset@test.com',
    ]);
    $userId = $user->id;
    $newPassword = 'NewAdminPass789!';

    $forgotResponse = $this->post(route('password.email'), [
        'email' => 'admin-reset@test.com',
    ]);
    $forgotResponse->assertSessionHasNoErrors();

    $this->assertDatabaseHas('password_reset_tokens', [
        'email' => 'admin-reset@test.com',
    ]);

    $tokenRow = DB::table('password_reset_tokens')
        ->where('email', 'admin-reset@test.com')
        ->first();
    expect($tokenRow)->not->toBeNull();

    $plainToken = null;
    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$plainToken, $tokenRow) {
        $plainToken = $notification->token;

        return Hash::check($notification->token, $tokenRow->token);
    });
    expect($plainToken)->not->toBeNull();

    $resetResponse = $this->post(route('password.update'), [
        'token' => $plainToken,
        'email' => 'admin-reset@test.com',
        'password' => $newPassword,
        'password_confirmation' => $newPassword,
    ]);
    $resetResponse
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('login'));

    $freshUser = User::find($userId);
    expect($freshUser)->not->toBeNull();
    expect(Hash::check($newPassword, $freshUser->password))->toBeTrue();
    expect(Hash::check('password', $freshUser->password))->toBeFalse();

    Auth::logout();
    $loginOk = Auth::guard('web')->attempt([
        'email' => 'admin-reset@test.com',
        'password' => $newPassword,
    ]);
    expect($loginOk)->toBeTrue();
    expect(Auth::user())->toBeInstanceOf(User::class);
    expect(Auth::user()->id)->toBe($userId);

    Auth::logout();
    $oldLoginOk = Auth::guard('web')->attempt([
        'email' => 'admin-reset@test.com',
        'password' => 'password',
    ]);
    expect($oldLoginOk)->toBeFalse();
});

test('customer forgot password flow creates token row, resets password, and new password login works', function () {
    Notification::fake();

    $customer = Customer::factory()->create([
        'email' => 'customer-reset@test.com',
    ]);
    $customerId = $customer->id;
    $newPassword = 'NewCustomerPass456!';

    expect(Hash::check('password', $customer->password))->toBeTrue();

    $forgotResponse = $this->post(route('password.email'), [
        'email' => 'customer-reset@test.com',
    ]);
    $forgotResponse->assertSessionHasNoErrors();

    $this->assertDatabaseHas('password_reset_tokens', [
        'email' => 'customer-reset@test.com',
    ]);

    $tokenRow = DB::table('password_reset_tokens')
        ->where('email', 'customer-reset@test.com')
        ->first();
    expect($tokenRow)->not->toBeNull();

    // Verify the notification was actually dispatched to the Customer via Notifiable trait
    // (this catches missing Notifiable trait that would otherwise throw notify() undefined)
    $plainToken = null;
    Notification::assertSentTo($customer, ResetPassword::class, function ($notification) use (&$plainToken, $tokenRow) {
        $plainToken = $notification->token;

        return Hash::check($notification->token, $tokenRow->token);
    });
    expect($plainToken)->not->toBeNull();

    $resetResponse = $this->post(route('password.update'), [
        'token' => $plainToken,
        'email' => 'customer-reset@test.com',
        'password' => $newPassword,
        'password_confirmation' => $newPassword,
    ]);
    $resetResponse
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('login'));

    $freshCustomer = Customer::find($customerId);
    expect($freshCustomer)->not->toBeNull();
    expect(Hash::check($newPassword, $freshCustomer->password))->toBeTrue();
    expect(Hash::check('password', $freshCustomer->password))->toBeFalse();

    Auth::logout();
    $loginOk = Auth::guard('web')->attempt([
        'email' => 'customer-reset@test.com',
        'password' => $newPassword,
    ]);
    expect($loginOk)->toBeTrue();
    expect(Auth::user())->toBeInstanceOf(Customer::class);
    expect(Auth::user()->id)->toBe($customerId);

    Auth::logout();
    $oldLoginOk = Auth::guard('web')->attempt([
        'email' => 'customer-reset@test.com',
        'password' => 'password',
    ]);
    expect($oldLoginOk)->toBeFalse();
});
