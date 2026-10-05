<?php

use App\Services\Analytics\GeoLocator;
use GeoIp2\Database\Reader;
use GeoIp2\Exception\AddressNotFoundException;
use GeoIp2\Model\Country;
use Tests\TestCase;

// The service reads config() and logs, so this needs a booted container even
// though no database or HTTP layer is involved.
uses(TestCase::class);

test('a two letter code from the database is passed through', function () {
    config(['analytics.geo' => 'country']);

    $reader = Mockery::mock(Reader::class);
    $reader->shouldReceive('country')
        ->with('2.125.160.10')
        ->andReturn(new Country(['country' => ['iso_code' => 'GB']]));

    expect((new GeoLocator(reader: $reader))->country('2.125.160.10'))->toBe('GB');
});

test('anything that is not an ISO alpha-2 code is discarded', function (?string $code) {
    config(['analytics.geo' => 'country']);

    $reader = Mockery::mock(Reader::class);
    $reader->shouldReceive('country')->andReturn(new Country(['country' => ['iso_code' => $code]]));

    expect((new GeoLocator(reader: $reader))->country('2.125.160.10'))->toBeNull();
})->with(['null' => [null], 'three letters' => ['GBR'], 'lowercase' => ['gb']]);

test('an address the database does not know yields no country', function () {
    config(['analytics.geo' => 'country']);

    $reader = Mockery::mock(Reader::class);
    $reader->shouldReceive('country')->andThrow(new AddressNotFoundException('not found'));

    expect((new GeoLocator(reader: $reader))->country('8.8.8.8'))->toBeNull();
});

test('a corrupt database cannot break a page view', function () {
    config(['analytics.geo' => 'country']);

    $reader = Mockery::mock(Reader::class);
    $reader->shouldReceive('country')->andThrow(new RuntimeException('truncated file'));

    expect((new GeoLocator(reader: $reader))->country('2.125.160.10'))->toBeNull();
});

test('the database is not opened at all when geolocation is off', function () {
    config(['analytics.geo' => 'none']);

    $reader = Mockery::mock(Reader::class);
    $reader->shouldNotReceive('country');

    expect((new GeoLocator(reader: $reader))->country('2.125.160.10'))->toBeNull();
});
