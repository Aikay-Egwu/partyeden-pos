<?php

declare(strict_types=1);

namespace App\Services;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Validation\ValidationException;

final class OrderScheduleService
{
    /**
     * Allowed time-of-day windows per fulfillment type (24h "H:i", local
     * checkout timezone). Delivery: 5:00 PM–9:00 PM. Collection: 12:00 PM–5:30 PM.
     *
     * @var array<string, array{0: string, 1: string}>
     */
    private const FULFILLMENT_WINDOWS = [
        'delivery' => ['17:00', '21:00'],
        'pickup' => ['12:00', '17:30'],
    ];

    /**
     * @return array{0: string, 1: string}
     */
    private function windowFor(string $fulfillmentType): array
    {
        return self::FULFILLMENT_WINDOWS[$fulfillmentType]
            ?? self::FULFILLMENT_WINDOWS['pickup'];
    }

    /** @param array<string, mixed> $cartContents */
    public function maximumTurnoverMinutes(array $cartContents): int
    {
        return (int) ceil((float) ($cartContents['turnover_time_hours'] ?? 0) * 60);
    }

    /** @param array<string, mixed> $cartContents */
    public function minimumExpectedAt(
        array $cartContents,
        string $fulfillmentType,
        ?DateTimeInterface $referenceTime = null,
        ?int $turnoverMinutes = null,
    ): CarbonImmutable {
        $timezone = (string) config('checkout.timezone', 'Europe/London');
        $now = $referenceTime === null
            ? CarbonImmutable::now($timezone)
            : CarbonImmutable::instance($referenceTime)->setTimezone($timezone);
        $minutes = $turnoverMinutes ?? $this->maximumTurnoverMinutes($cartContents);
        $minimum = $now->addMinutes($minutes);

        if ($minimum->format('s.u') !== '00.000000') {
            $minimum = $minimum->startOfMinute()->addMinute();
        }

        // Never schedule before the window opens today (e.g. collection before 12:00).
        [$windowStart] = $this->windowFor($fulfillmentType);
        $start = $now->setTime(
            (int) substr($windowStart, 0, 2),
            (int) substr($windowStart, 3, 2),
        );
        if ($minimum->lessThan($start)) {
            $minimum = $start;
        }

        return $minimum;
    }

    /** @param array<string, mixed> $cartContents */
    public function validateExpectedAt(
        string $expectedAt,
        array $cartContents,
        string $fulfillmentType,
        ?DateTimeInterface $referenceTime = null,
        ?int $turnoverMinutes = null,
    ): CarbonImmutable {
        $timezone = (string) config('checkout.timezone', 'Europe/London');

        try {
            $scheduledAt = CarbonImmutable::createFromFormat('!Y-m-d\TH:i', $expectedAt, $timezone);
        } catch (\InvalidArgumentException) {
            $scheduledAt = false;
        }

        if (! $scheduledAt instanceof CarbonImmutable || $scheduledAt->format('Y-m-d\TH:i') !== $expectedAt) {
            throw ValidationException::withMessages([
                'expected_at' => 'Choose a valid delivery or collection date and time.',
            ]);
        }

        $minimum = $this->minimumExpectedAt(
            $cartContents,
            $fulfillmentType,
            $referenceTime,
            $turnoverMinutes,
        );

        if ($scheduledAt->lessThan($minimum)) {
            throw ValidationException::withMessages([
                'expected_at' => 'This order needs more preparation time. Choose a later date and time.',
            ]);
        }

        [$windowStart, $windowEnd] = $this->windowFor($fulfillmentType);
        $time = $scheduledAt->format('H:i');

        if ($time < $windowStart || $time > $windowEnd) {
            throw ValidationException::withMessages([
                'expected_at' => $fulfillmentType === 'delivery'
                    ? 'Delivery is available between 5:00 PM and 9:00 PM.'
                    : 'Collection is available between 12:00 PM and 5:30 PM.',
            ]);
        }

        return $scheduledAt->utc();
    }
}
