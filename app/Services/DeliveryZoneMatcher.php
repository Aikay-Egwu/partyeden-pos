<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use Illuminate\Support\Collection;

/**
 * Matches customer postcodes to the most specific active delivery zone prefix.
 */
class DeliveryZoneMatcher
{
    public function find(?string $postcode): ?DeliveryZone
    {
        $normalizedPostcode = self::normalize($postcode);

        if ($normalizedPostcode === null) {
            return null;
        }

        /** @var Collection<int, DeliveryZonePostcodePrefix> $prefixes */
        $prefixes = DeliveryZonePostcodePrefix::query()
            ->where('is_active', true)
            ->with(['zone' => fn ($query) => $query->where('is_active', true)])
            ->get()
            ->sortByDesc(fn (DeliveryZonePostcodePrefix $prefix) => strlen($prefix->code_prefix))
            ->values();

        foreach ($prefixes as $prefix) {
            $normalizedPrefix = self::normalize($prefix->code_prefix);

            if ($normalizedPrefix !== null && str_starts_with($normalizedPostcode, $normalizedPrefix)) {
                return $prefix->zone;
            }
        }

        return null;
    }

    public static function normalize(?string $postcode): ?string
    {
        if ($postcode === null) {
            return null;
        }

        $normalized = strtoupper((string) preg_replace('/\s+/', '', trim($postcode)));

        return $normalized === '' ? null : $normalized;
    }
}
