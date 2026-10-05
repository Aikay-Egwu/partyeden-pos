<?php

use App\Services\Analytics\AnalyticsAggregator;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

const LEDGERS = [
    'analytics_daily_stats',
    'analytics_daily_pages',
    'analytics_daily_visitors',
    'analytics_daily_page_visitors',
];

/**
 * Writes one event through the real aggregator so the raw row, the counters and
 * both ledgers all land on the same date, exactly as a live page view would.
 */
function store(string $hash, string $path, Carbon|int $when = 0): void
{
    $at = $when instanceof Carbon ? $when : Carbon::now()->subDays($when);

    app(AnalyticsAggregator::class)->ingest([
        'visit_hash' => $hash,
        'kind' => 'page_view',
        'path' => $path,
        'referrer_host' => null,
        'country' => null,
        'recorded_at' => $at->toDateTimeString(),
    ]);
}

function counterTotals(): array
{
    return [
        'views' => (int) DB::table('analytics_daily_stats')->sum('views'),
        'pages' => (int) DB::table('analytics_daily_pages')->sum('views'),
        'visitors' => DB::table('analytics_daily_visitors')->count(),
    ];
}

/**
 * Only the two aggregate counters, without the ledgers, which are pruned on
 * their own schedule and so are a separate concern.
 */
function aggregateCounters(): array
{
    return [
        'views' => (int) DB::table('analytics_daily_stats')->sum('views'),
        'pages' => (int) DB::table('analytics_daily_pages')->sum('views'),
    ];
}

test('pruning removes raw events past the retention window and keeps the boundary day', function () {
    store('aaaaaaaaaaaaaaaa', '/', Carbon::now()->subDays(91));
    store('bbbbbbbbbbbbbbbb', '/', Carbon::now()->subDays(90));
    store('cccccccccccccccc', '/', Carbon::now()->subDays(89));
    store('dddddddddddddddd', '/mapps');

    expect(DB::table('analytics_events')->count())->toBe(4);

    $this->artisan('analytics:prune')->assertSuccessful();

    expect(DB::table('analytics_events')->count())->toBe(3)
        ->and(DB::table('analytics_events')->where('recorded_at', '<', Carbon::now()->subDays(90)->startOfDay())->count())->toBe(0);
});

test('the visitor ledgers are kept for longer than the raw events', function () {
    // Inside the raw window, inside the ledger window: nothing goes.
    store('aaaaaaaaaaaaaaaa', '/', Carbon::now()->subDays(10));
    // Past the raw window but well inside the ledger window: the event row goes
    // and the pseudonym that makes the unique count exact stays.
    store('bbbbbbbbbbbbbbbb', '/', Carbon::now()->subDays(200));
    // Past the ledger window too, including the boundary day itself.
    store('cccccccccccccccc', '/', Carbon::now()->subDays(365));
    store('dddddddddddddddd', '/', Carbon::now()->subDays(366));

    $this->artisan('analytics:prune')->assertSuccessful();

    expect(DB::table('analytics_events')->count())->toBe(1)
        ->and(DB::table('analytics_daily_visitors')->count())->toBe(3)
        ->and(DB::table('analytics_daily_page_visitors')->count())->toBe(3);
});

test('pruning never touches the daily counters', function () {
    store('aaaaaaaaaaaaaaaa', '/', Carbon::now()->subDays(500));
    store('bbbbbbbbbbbbbbbb', '/mapps', Carbon::now()->subDays(500));

    $before = aggregateCounters();

    $this->artisan('analytics:prune', ['--days' => 1, '--ledger-days' => 1])->assertSuccessful();

    // The counters are the only long-term trend left once raw events expire, so
    // they are kept indefinitely: a handful of rows a day, no pseudonyms.
    expect(DB::table('analytics_events')->count())->toBe(0)
        ->and(DB::table('analytics_daily_visitors')->count())->toBe(0)
        ->and(aggregateCounters())->toBe($before)
        ->and($before['views'])->toBe(2);
});

test('a dry run reports what it would delete without deleting anything', function () {
    store('aaaaaaaaaaaaaaaa', '/', Carbon::now()->subDays(200));

    $this->artisan('analytics:prune', ['--dry-run' => true])
        ->assertSuccessful()
        ->expectsOutputToContain('Would delete 1 raw events');

    expect(DB::table('analytics_events')->count())->toBe(1)
        ->and(DB::table('analytics_daily_visitors')->count())->toBe(1);
});

test('the retention window can be overridden per run', function () {
    store('aaaaaaaaaaaaaaaa', '/', Carbon::now()->subDays(5));
    store('bbbbbbbbbbbbbbbb', '/', Carbon::now()->subDays(20));

    $this->artisan('analytics:prune', ['--days' => 10])->assertSuccessful();

    expect(DB::table('analytics_events')->count())->toBe(1)
        ->and(DB::table('analytics_events')->value('visit_hash'))->toBe('aaaaaaaaaaaaaaaa');
});

test('backfill rebuilds the counters from stored events', function () {
    store('aaaaaaaaaaaaaaaa', '/');
    store('aaaaaaaaaaaaaaaa', '/');
    store('aaaaaaaaaaaaaaaa', '/mapps');
    store('bbbbbbbbbbbbbbbb', '/');

    expect(counterTotals())->toBe(['views' => 4, 'pages' => 4, 'visitors' => 2]);

    foreach (LEDGERS as $table) {
        DB::table($table)->delete();
    }

    $this->artisan('analytics:backfill')->assertSuccessful();

    expect(counterTotals())->toBe(['views' => 4, 'pages' => 4, 'visitors' => 2])
        // Rebuilding must never duplicate the raw rows it read.
        ->and(DB::table('analytics_events')->count())->toBe(4);
});

test('backfill refuses to replay over counters that already hold data', function () {
    store('aaaaaaaaaaaaaaaa', '/');

    $this->artisan('analytics:backfill')
        ->assertFailed()
        ->expectsOutputToContain('double counted');

    expect((int) DB::table('analytics_daily_stats')->sum('views'))->toBe(1);
});

test('backfill with force adds to the existing counters', function () {
    store('aaaaaaaaaaaaaaaa', '/');

    $this->artisan('analytics:backfill', ['--force' => true])->assertSuccessful();

    // Documented, not accidental: --force means "I know this overlaps".
    expect((int) DB::table('analytics_daily_stats')->sum('views'))->toBe(2);
});

test('backfill with nothing stored is a no-op', function () {
    $this->artisan('analytics:backfill')
        ->assertSuccessful()
        ->expectsOutputToContain('No stored events to replay.');
});
