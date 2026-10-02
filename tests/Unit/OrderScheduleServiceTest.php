<?php

use App\Services\OrderScheduleService;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

test('it floors the minimum collection time to the start of the pickup window', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 10:00:30', 'Europe/London');

    // Turnover alone would allow 11:16, but collection cannot start before 12:00.
    $minimum = $service->minimumExpectedAt(
        ['turnover_time_hours' => '1.25'],
        'pickup',
        $now,
    );

    expect($minimum->format('Y-m-d\TH:i'))->toBe('2026-09-28T12:00');
});

test('it floors the minimum delivery time to the start of the delivery window', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 10:00:00', 'Europe/London');

    $minimum = $service->minimumExpectedAt(
        ['turnover_time_hours' => '0'],
        'delivery',
        $now,
    );

    expect($minimum->format('Y-m-d\TH:i'))->toBe('2026-09-28T17:00');
});

test('it only accepts delivery between 5pm and 9pm and returns the time in utc', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 10:00:00', 'Europe/London');
    $cart = ['turnover_time_hours' => '0'];

    // Just before the window opens.
    expect(fn () => $service->validateExpectedAt('2026-09-29T16:59', $cart, 'delivery', $now))
        ->toThrow(ValidationException::class);

    // Window opens at 17:00.
    $opens = $service->validateExpectedAt('2026-09-29T17:00', $cart, 'delivery', $now);
    expect($opens->timezone('Europe/London')->format('Y-m-d\TH:i'))->toBe('2026-09-29T17:00');

    // Window closes at 21:00 (inclusive).
    $closes = $service->validateExpectedAt('2026-09-29T21:00', $cart, 'delivery', $now);
    expect($closes->timezone('Europe/London')->format('Y-m-d\TH:i'))->toBe('2026-09-29T21:00');

    // Just after the window closes.
    expect(fn () => $service->validateExpectedAt('2026-09-29T21:01', $cart, 'delivery', $now))
        ->toThrow(ValidationException::class);
});

test('it only accepts collection between 12pm and 5:30pm', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 09:00:00', 'Europe/London');
    $cart = ['turnover_time_hours' => '0'];

    // Window opens at 12:00.
    $opens = $service->validateExpectedAt('2026-09-28T12:00', $cart, 'pickup', $now);
    expect($opens->timezone('Europe/London')->format('Y-m-d\TH:i'))->toBe('2026-09-28T12:00');

    // Window closes at 17:30 (inclusive).
    $closes = $service->validateExpectedAt('2026-09-28T17:30', $cart, 'pickup', $now);
    expect($closes->timezone('Europe/London')->format('Y-m-d\TH:i'))->toBe('2026-09-28T17:30');

    // Just after the window closes.
    expect(fn () => $service->validateExpectedAt('2026-09-28T17:31', $cart, 'pickup', $now))
        ->toThrow(ValidationException::class);
});

test('it rejects collection times before the preparation window', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 10:00:00', 'Europe/London');

    $service->validateExpectedAt(
        '2026-09-28T10:59',
        ['turnover_time_hours' => '1'],
        'pickup',
        $now,
    );
})->throws(ValidationException::class);
