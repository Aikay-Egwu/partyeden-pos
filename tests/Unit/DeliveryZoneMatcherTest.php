<?php

use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use App\Services\DeliveryZoneMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it matches the most specific active delivery zone prefix', function () {
    $broadZone = DeliveryZone::create([
        'name' => 'London',
        'delivery_price' => 10,
        'is_active' => true,
    ]);

    $specificZone = DeliveryZone::create([
        'name' => 'Central London',
        'delivery_price' => 15,
        'is_active' => true,
    ]);

    DeliveryZonePostcodePrefix::create([
        'delivery_zone_id' => $broadZone->id,
        'code_prefix' => 'SW',
        'is_active' => true,
    ]);

    DeliveryZonePostcodePrefix::create([
        'delivery_zone_id' => $specificZone->id,
        'code_prefix' => 'SW1A',
        'is_active' => true,
    ]);

    $matcher = app(DeliveryZoneMatcher::class);

    expect($matcher->find('sw1a 2aa')?->id)->toBe($specificZone->id);
});

test('it returns null when no delivery zone matches the postcode', function () {
    $matcher = app(DeliveryZoneMatcher::class);

    expect($matcher->find('ZZ1 1ZZ'))->toBeNull();
});
