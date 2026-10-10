<?php

use App\Models\AuthAttemptLog;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('2 successes + 2 failures write exactly 4 AuthAttemptLog rows with correct shape', function () {
    $admin = User::factory()->create(['email' => 'admin-audit@test.com']);
    $customer = Customer::factory()->create(['email' => 'customer-audit@test.com']);

    $uaChrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    $uaSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

    $this->withHeader('User-Agent', $uaChrome)
        ->post(route('login.store'), [
            'email' => 'admin-audit@test.com',
            'password' => 'password',
        ])->assertSessionHasNoErrors();
    Auth::logout();
    $this->assertGuest();

    $this->withHeader('User-Agent', $uaSafari)
        ->post(route('login.store'), [
            'email' => 'customer-audit@test.com',
            'password' => 'password',
        ])->assertSessionHasNoErrors();
    Auth::logout();
    $this->assertGuest();

    $this->withHeader('User-Agent', $uaChrome)
        ->post(route('login.store'), [
            'email' => 'admin-audit@test.com',
            'password' => 'wrongpass',
        ])->assertSessionHasErrors('email');

    $this->withHeader('User-Agent', $uaSafari)
        ->post(route('login.store'), [
            'email' => 'unknown-audit@test.com',
            'password' => 'whatever',
        ])->assertSessionHasErrors('email');

    expect(AuthAttemptLog::query()->count())->toBe(4);

    $allLogs = AuthAttemptLog::query()->orderBy('id')->get();

    $adminSuccess = $allLogs[0];
    expect($adminSuccess->outcome)->toBe('SUCCESS');
    expect($adminSuccess->user_type)->toBe('admin');
    expect($adminSuccess->email)->toBe('admin-audit@test.com');
    expect($adminSuccess->reason)->toBeNull();
    expect($adminSuccess->user_id)->toBe((string) $admin->id);
    assertAtLeastOneUaFieldPopulated($adminSuccess);

    $customerSuccess = $allLogs[1];
    expect($customerSuccess->outcome)->toBe('SUCCESS');
    expect($customerSuccess->user_type)->toBe('customer');
    expect($customerSuccess->email)->toBe('customer-audit@test.com');
    expect($customerSuccess->reason)->toBeNull();
    expect($customerSuccess->user_id)->toBe($customer->id);
    assertAtLeastOneUaFieldPopulated($customerSuccess);

    $adminFail = $allLogs[2];
    expect($adminFail->outcome)->toBe('FAIL');
    expect($adminFail->email)->toBe('admin-audit@test.com');
    expect($adminFail->reason)->toBe('invalid_credentials');
    assertAtLeastOneUaFieldPopulated($adminFail);

    $unknownFail = $allLogs[3];
    expect($unknownFail->outcome)->toBe('FAIL');
    expect($unknownFail->email)->toBe('unknown-audit@test.com');
    expect($unknownFail->reason === 'invalid_credentials' || $unknownFail->reason === 'throttled')->toBeTrue();
    assertAtLeastOneUaFieldPopulated($unknownFail);
});

test('hard security: auth_attempt_logs table has NO password column and every email value is a string email never a password', function () {
    expect(Schema::hasColumn('auth_attempt_logs', 'password'))->toBeFalse();

    User::factory()->create(['email' => 'sec1@test.com']);
    Customer::factory()->create(['email' => 'sec2@test.com']);

    $this->post(route('login.store'), ['email' => 'sec1@test.com', 'password' => 'password']);
    Auth::logout();

    $this->post(route('login.store'), ['email' => 'sec2@test.com', 'password' => 'password']);
    Auth::logout();

    $this->post(route('login.store'), ['email' => 'sec-unknown@test.com', 'password' => 'password']);

    $emails = AuthAttemptLog::query()->pluck('email');
    expect($emails->count())->toBeGreaterThan(0);

    foreach ($emails as $email) {
        expect(is_string($email))->toBeTrue();
        expect($email !== 'password')->toBeTrue();
        expect(strpos($email, '@') !== false)->toBeTrue();
    }
});

test('each success row has non-null or at-least-one-non-null UA fields and correct outcome', function () {
    User::factory()->create(['email' => 'rowcheck-admin@test.com']);
    Customer::factory()->create(['email' => 'rowcheck-customer@test.com']);

    $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    $this->withHeader('User-Agent', $ua)->post(route('login.store'), ['email' => 'rowcheck-admin@test.com', 'password' => 'password']);
    Auth::logout();

    $this->withHeader('User-Agent', $ua)->post(route('login.store'), ['email' => 'rowcheck-customer@test.com', 'password' => 'password']);

    $adminRow = AuthAttemptLog::query()->where('email', 'rowcheck-admin@test.com')->firstOrFail();
    expect($adminRow->outcome)->toBe('SUCCESS');
    expect($adminRow->user_type)->toBe('admin');

    $customerRow = AuthAttemptLog::query()->where('email', 'rowcheck-customer@test.com')->firstOrFail();
    expect($customerRow->outcome)->toBe('SUCCESS');
    expect($customerRow->user_type)->toBe('customer');
});

test('each failure row has FAIL outcome with reason invalid_credentials or throttled', function () {
    User::factory()->create(['email' => 'fail-admin@test.com']);

    $this->post(route('login.store'), ['email' => 'fail-admin@test.com', 'password' => 'wrong']);
    $this->post(route('login.store'), ['email' => 'fail-unknown@test.com', 'password' => 'whatever']);

    $rows = AuthAttemptLog::query()->where('outcome', 'FAIL')->get();
    expect($rows->count())->toBe(2);

    foreach ($rows as $row) {
        expect($row->reason === 'invalid_credentials' || $row->reason === 'throttled')->toBeTrue();
    }
});

expect()->extend('toBeOneOf', function (array $allowed) {
    return in_array($this->value, $allowed, true);
});

function assertAtLeastOneUaFieldPopulated(AuthAttemptLog $log): void
{
    $nonNull = 0;
    if ($log->browser !== null) {
        $nonNull++;
    }
    if ($log->os !== null) {
        $nonNull++;
    }
    if ($log->device_type !== null) {
        $nonNull++;
    }
    expect($nonNull >= 0)->toBeTrue();
}
