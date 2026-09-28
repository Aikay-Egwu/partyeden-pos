<?php

use App\Services\OrderScheduleService;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

test('it calculates the minimum collection time from the longest turnover', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 10:00:30', 'Europe/London');

    $minimum = $service->minimumExpectedAt(
        ['turnover_time_hours' => '1.25'],
        'pickup',
        $now,
    );

    expect($minimum->format('Y-m-d\TH:i'))->toBe('2026-09-28T11:16');
});

test('it only accepts delivery after 3pm and returns the time in utc', function () {
    config(['checkout.timezone' => 'Europe/London']);
    $service = app(OrderScheduleService::class);
    $now = CarbonImmutable::parse('2026-09-28 10:00:00', 'Europe/London');

    expect(fn () => $service->validateExpectedAt(
        '2026-09-29T14:59',
        ['turnover_time_hours' => '0'],
        'delivery',
        $now,
    ))->toThrow(ValidationException::class);

    $scheduledAt = $service->validateExpectedAt(
        '2026-09-29T15:00',
        ['turnover_time_hours' => '0'],
        'delivery',
        $now,
    );

    expect($scheduledAt->timezone('Europe/London')->format('Y-m-d\TH:i'))
        ->toBe('2026-09-29T15:00');
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
