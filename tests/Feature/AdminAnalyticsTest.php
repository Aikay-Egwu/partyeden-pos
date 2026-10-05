<?php

use App\Models\User;
use App\Services\Analytics\GeoLocator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

const DASHBOARD_CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function record(string $path = '/', string $ip = '2.125.160.10'): void
{
    test()->withServerVariables(['REMOTE_ADDR' => $ip])
        ->get($path, [
            'Accept' => 'text/html, application/xhtml+xml',
            'User-Agent' => DASHBOARD_CHROME,
        ]);
}

test('guests cannot view the analytics dashboard', function () {
    $this->get(route('admin.analytics.index'))->assertRedirect(route('login'));
});

test('the dashboard summarises recorded traffic from the daily counters', function () {
    record('/');
    record('/');
    record('/mapps');
    record('/', ip: '8.26.56.10');

    $this->actingAs(User::factory()->create());

    $this->get(route('admin.analytics.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/analytics/index')
            ->where('period', 30)
            ->where('totals.views', 4)
            ->where('totals.visitors', 2)
            ->where('totals.new_visitors', null)
            ->where('topPages.0.path', '/')
            ->where('topPages.0.views', 3)
            ->where('topPages.0.visitors', 2)
            ->where('topPages.1.path', '/mapps')
            ->where('breakdownsFrom', now()->subDays(29)->format('j M Y'))
            ->where('breakdownViews', 4)
            ->has('series', 30)
            ->where('series.29.date', now()->toDateString())
            ->where('series.29.label', now()->format('j M'))
            ->where('series.29.views', 4));
});

test('countries come from the visitor ledger', function () {
    app()->instance(GeoLocator::class, new class extends GeoLocator
    {
        public function country(?string $ip): ?string
        {
            return $ip === '8.26.56.10' ? 'US' : 'GB';
        }
    });

    record('/');
    record('/mapps');
    record('/wmd', ip: '8.26.56.10');

    $this->actingAs(User::factory()->create());

    // One visitor per country here, so the ordering that is being pinned down
    // is the alphabetical tiebreak rather than the count.
    $this->get(route('admin.analytics.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('countries.0.label', 'GB')
            ->where('countries.0.visitors', 1)
            ->where('countries.1.label', 'US')
            ->where('countries.1.visitors', 1));
});

test('the requested period is validated and clamped', function (string $requested, int $expected) {
    $this->actingAs(User::factory()->create());

    $this->get(route('admin.analytics.index', ['period' => $requested]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('period', $expected)
            ->has('series', $expected));
})->with([
    'seven days' => ['7', 7],
    'a year' => ['365', 365],
    'an unknown value falls back' => ['bogus', 30],
    'an unsupported range falls back' => ['14', 30],
    'a huge range falls back' => ['100000', 30],
]);

test('breakdowns are hidden when raw events are not stored', function () {
    config(['analytics.raw' => false]);

    record('/');

    $this->actingAs(User::factory()->create());

    $this->get(route('admin.analytics.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('breakdownsFrom', null)
            ->where('breakdownViews', 0)
            ->where('referrers', [])
            ->where('devices', [])
            ->where('browsers', [])
            ->where('totals.views', 1));
});
