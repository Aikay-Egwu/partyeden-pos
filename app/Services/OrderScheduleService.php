<?php

declare(strict_types=1);

namespace App\Services;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Validation\ValidationException;

final class OrderScheduleService
{
    public function maximumTurnoverMinutes(array $cartContents): int
    {
        return (int) ceil((float) ($cartContents['turnover_time_hours'] ?? 0) * 60);
    }

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

        if ($fulfillmentType === 'delivery') {
            $deliveryStart = $now->setTime(15, 0);
            if ($minimum->lessThan($deliveryStart)) {
                $minimum = $deliveryStart;
            }
        }

        return $minimum;
    }

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

        if ($fulfillmentType === 'delivery' && $scheduledAt->format('H:i') < '15:00') {
            throw ValidationException::withMessages([
                'expected_at' => 'Delivery is available from 3:00 PM onwards.',
            ]);
        }

        return $scheduledAt->utc();
    }
}
