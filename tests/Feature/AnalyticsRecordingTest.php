<?php

use App\Models\TeamMember;
use App\Services\Analytics\AnalyticsAggregator;
use App\Services\Analytics\GeoLocator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * A browser-shaped request: the recorder deliberately ignores traffic that
 * sends neither an Accept header nor a user agent, because that is what health
 * checks, crawlers and curl look like.
 */
function browse(string $uri = '/', array $headers = [], array $server = []): TestResponse
{
    if ($server !== []) {
        test()->withServerVariables($server);
    }

    return test()->get($uri, array_merge([
        'Accept' => 'text/html, application/xhtml+xml',
        'User-Agent' => CHROME,
    ], $headers));
}

function analyticsRows(): array
{
    return [
        'events' => DB::table('analytics_events')->count(),
        'views' => (int) DB::table('analytics_daily_stats')->sum('views'),
        'pages' => (int) DB::table('analytics_daily_pages')->sum('views'),
        'visitors' => DB::table('analytics_daily_visitors')->count(),
        'page_visitors' => DB::table('analytics_daily_page_visitors')->count(),
    ];
}

test('a public page view is recorded once in the raw table and once in every counter', function () {
    browse('/')->assertOk();

    expect(analyticsRows())->toBe([
        'events' => 1,
        'views' => 1,
        'pages' => 1,
        'visitors' => 1,
        'page_visitors' => 1,
    ]);

    expect(DB::table('analytics_events')->first())
        ->path->toBe('/')
        ->kind->toBe('page_view');
});

test('repeat views from the same visitor add views but not uniques', function () {
    browse('/');
    browse('/mapps');
    browse('/mapps');

    $rows = analyticsRows();

    expect($rows['views'])->toBe(3)
        ->and($rows['visitors'])->toBe(1)
        ->and($rows['page_visitors'])->toBe(2);

    expect((int) DB::table('analytics_daily_pages')->where('path', '/mapps')->sum('views'))->toBe(2);
});

test('a different connection on the same day counts as another visitor', function () {
    browse('/', server: ['REMOTE_ADDR' => '2.125.160.10']);
    browse('/', server: ['REMOTE_ADDR' => '8.26.56.10']);

    expect(analyticsRows()['visitors'])->toBe(2);
});

test('a visitor on the same connection is pseudonymised to a short stable hash', function () {
    browse('/', server: ['REMOTE_ADDR' => '2.125.160.10']);

    $hash = DB::table('analytics_events')->value('visit_hash');

    expect($hash)->toHaveLength(16)
        ->and($hash)->not->toContain('2.125')
        ->and($hash)->not->toContain('26');
});

test('query strings are dropped and dynamic paths are collapsed', function () {
    TeamMember::create(['name' => 'Jane Doe', 'role' => 'Director']);

    browse('/?utm_source=google&email=someone@example.com');
    browse('/team/jane-doe');

    expect(DB::table('analytics_events')->pluck('path')->all())
        ->toBe(['/', '/team/*']);
});

test('crawlers are not recorded', function (string $agent) {
    browse('/', ['User-Agent' => $agent]);

    expect(analyticsRows()['events'])->toBe(0);
})->with([
    'curl' => ['curl/8.6.0'],
    'googlebot' => ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    'lighthouse' => ['Lighthouse/11.0 Chrome/120'],
]);

test('requests with no user agent are not recorded', function () {
    // The test client sends a default Symfony user agent unless one is given,
    // so the header has to be blanked rather than simply omitted.
    test()->get('/', ['Accept' => 'text/html, application/xhtml+xml', 'User-Agent' => '']);

    expect(analyticsRows()['events'])->toBe(0);
});

test('our own addresses can be excluded from the counts entirely', function () {
    config(['analytics.exclude_ips' => ['2.125.160.10']]);

    browse('/', server: ['REMOTE_ADDR' => '2.125.160.10']);
    browse('/mapps', server: ['REMOTE_ADDR' => '8.26.56.10']);

    expect(analyticsRows()['events'])->toBe(1)
        ->and(DB::table('analytics_events')->value('path'))->toBe('/mapps');
});

test('internal routes are excluded', function (string $uri) {
    browse($uri);

    expect(analyticsRows()['events'])->toBe(0);
})->with([
    'health check' => ['/up'],
    'admin' => ['/mapps-admin/news'],
    'json api' => ['/api/news'],
]);

test('error responses are not counted as visits', function () {
    browse('/this-page-does-not-exist');

    expect(analyticsRows()['events'])->toBe(0);
});

test('redirects are not counted as visits', function () {
    browse('/subscription/cancel')->assertRedirect();

    expect(analyticsRows()['events'])->toBe(0);
});

test('the whole feature can be switched off', function () {
    config(['analytics.enabled' => false]);
    browse('/');

    expect(analyticsRows()['events'])->toBe(0);
});

test('sampling is deterministic for a given visitor', function (int $rate, int $expected) {
    config(['analytics.sample_rate' => $rate]);

    browse('/');
    browse('/mapps');

    expect(analyticsRows()['events'])->toBe($expected);
})->with([
    'nothing at 0 percent' => [0, 0],
    'everything at 100 percent' => [100, 2],
]);

test('raw events can be disabled while counters keep running', function () {
    config(['analytics.raw' => false]);

    browse('/');

    $rows = analyticsRows();

    expect($rows['events'])->toBe(0)->and($rows['views'])->toBe(1);
});

test('country reaches both the event and the visitor ledger', function () {
    app()->instance(GeoLocator::class, new class extends GeoLocator
    {
        public function country(?string $ip): ?string
        {
            return 'GB';
        }
    });

    browse('/', server: ['REMOTE_ADDR' => '2.125.160.10']);

    expect(DB::table('analytics_events')->value('country'))->toBe('GB')
        ->and(DB::table('analytics_daily_visitors')->value('country'))->toBe('GB');
});

test('nothing is left on a persistent queue where an address could leak', function () {
    config(['analytics.connection' => 'deferred']);

    browse('/');

    // The default queue connection here is "database", so anything queued
    // would be serialized into the jobs table. Recording must ride the
    // post-response deferred queue instead.
    expect(DB::table('jobs')->count())->toBe(0);
});

test('geolocation degrades to null rather than failing when the database is absent', function () {
    config(['analytics.geo_database' => storage_path('app/private/geo/definitely-not-here.mmdb')]);

    expect(app(GeoLocator::class)->country('2.125.160.10'))->toBeNull();

    browse('/');

    expect(DB::table('analytics_events')->value('country'))->toBeNull();
});

test('non routable addresses are never geolocated', function () {
    config(['analytics.geo' => 'country']);

    $geo = app(GeoLocator::class);

    expect($geo->country('127.0.0.1'))->toBeNull()
        ->and($geo->country('10.1.2.3'))->toBeNull()
        ->and($geo->country('::1'))->toBeNull()
        ->and($geo->country(null))->toBeNull();
});

test('a failed analytics write costs a data point, not a page', function () {
    DB::shouldReceive('transaction')->andThrow(new RuntimeException('connection lost'));

    app(AnalyticsAggregator::class)->ingest([
        'visit_hash' => '0123456789abcdef',
        'kind' => 'page_view',
        'path' => '/',
        'referrer_host' => null,
        'country' => null,
        'recorded_at' => now()->toDateTimeString(),
    ]);
})->throwsNoExceptions();
