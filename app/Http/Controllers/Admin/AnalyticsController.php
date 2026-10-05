<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Reads the analytics rollups. Nothing here scans analytics_events except the
 * three breakdown queries, which are bounded by the raw retention window and
 * cached, because that table is the only place referrers and devices survive.
 */
class AnalyticsController extends Controller
{
    private const PERIODS = [7, 30, 90, 365];

    /**
     * Bump this whenever the shape of a cached payload changes, so a deploy does
     * not serve the previous shape out of a warm cache for up to five minutes.
     */
    private const CACHE_VERSION = 'v2';

    public function index(Request $request): Response
    {
        $period = (int) $request->integer('period', 30);

        if (! in_array($period, self::PERIODS, true)) {
            $period = 30;
        }

        $to = Carbon::now()->startOfDay();
        $from = $to->copy()->subDays($period - 1);
        $previousTo = $from->copy()->subDay();
        $previousFrom = $previousTo->copy()->subDays($period - 1);

        $current = $this->summary($from->toDateString(), $to->toDateString());
        $previous = $this->summary($previousFrom->toDateString(), $previousTo->toDateString());
        $breakdownFrom = $this->breakdownStart($from);

        return Inertia::render('admin/analytics/index', [
            'period' => $period,
            'periods' => self::PERIODS,
            'range' => [
                // Display strings, not ISO dates: parsing a date-only ISO string
                // in the browser reads it as UTC midnight and can show the
                // previous day in a negative offset.
                'from' => $from->format('j M Y'),
                'to' => $to->format('j M Y'),
            ],
            'totals' => $current,
            'previous' => $previous,
            'series' => $this->series($from, $to),
            'topPages' => $this->topPages($from->toDateString(), $to->toDateString()),
            'countries' => $current['countries'],
            'referrers' => $breakdownFrom === null ? [] : $this->breakdown('referrer_host', $breakdownFrom, $to),
            'devices' => $breakdownFrom === null ? [] : $this->breakdown('device_type', $breakdownFrom, $to),
            'browsers' => $breakdownFrom === null ? [] : $this->breakdown('browser', $breakdownFrom, $to),
            'breakdownsFrom' => $breakdownFrom?->format('j M Y'),
            'breakdownViews' => $breakdownFrom === null ? 0 : $this->breakdownViews($breakdownFrom, $to),
            // Pre-formatted on the server: the reports are cached for five
            // minutes, and the dashboard should say how stale it is. Formatting
            // a timestamp in the browser instead would render differently under
            // SSR than after hydration.
            'generatedAt' => now()->format('j M Y, H:i T'),
        ]);
    }

    /**
     * Every report is cached separately by period, so a visitor switching
     * between ranges never pays for a range somebody else already opened.
     */
    private function cacheKey(string $name, string ...$parts): string
    {
        return 'analytics:'.self::CACHE_VERSION.':'.$name.':'.implode(':', $parts);
    }

    /**
     * @return array{views: int, visitors: int, new_visitors: int|null, views_per_visitor: float, countries: list<array{label: string, visitors: int}>}
     */
    private function summary(string $from, string $to): array
    {
        return Cache::remember($this->cacheKey('summary', $from, $to), now()->addMinutes(5), function () use ($from, $to) {
            $views = (int) DB::table('analytics_daily_stats')->whereBetween('date', [$from, $to])->sum('views');
            $visitors = (int) DB::table('analytics_daily_visitors')->whereBetween('date', [$from, $to])->count();
            $new = (int) DB::table('analytics_daily_stats')->whereBetween('date', [$from, $to])->sum('new_visitors');

            return [
                'views' => $views,
                'visitors' => $visitors,
                // null rather than zero: a zero would read as "no new visitors",
                // when in fact the feature is switched off.
                'new_visitors' => config('analytics.track_returning') ? $new : null,
                'views_per_visitor' => $visitors > 0 ? round($views / $visitors, 2) : 0.0,
                'countries' => DB::table('analytics_daily_visitors')
                    ->select('country as label', DB::raw('COUNT(*) as visitors'))
                    ->whereBetween('date', [$from, $to])
                    ->whereNotNull('country')
                    ->groupBy('country')
                    // Ties broken alphabetically: without a secondary sort the
                    // same dashboard can reorder itself between two refreshes.
                    ->orderByDesc('visitors')
                    ->orderBy('country')
                    ->limit(12)
                    ->get()
                    ->map(fn ($row) => ['label' => (string) $row->label, 'visitors' => (int) $row->visitors])
                    ->all(),
            ];
        });
    }

    /**
     * A point per day with no holes, so the chart does not silently invent
     * continuity between days that happen to have no data.
     *
     * @return list<array{date: string, label: string, views: int, visitors: int}>
     */
    private function series(Carbon $from, Carbon $to): array
    {
        return Cache::remember($this->cacheKey('series', $from->toDateString(), $to->toDateString()), now()->addMinutes(5), function () use ($from, $to) {
            $views = DB::table('analytics_daily_stats')
                ->select('date', DB::raw('SUM(views) as views'))
                ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
                ->groupBy('date')
                ->pluck('views', 'date');

            $visitors = DB::table('analytics_daily_visitors')
                ->select('date', DB::raw('COUNT(*) as visitors'))
                ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
                ->groupBy('date')
                ->pluck('visitors', 'date');

            return collect(range(0, (int) round($from->diffInDays($to))))
                ->map(function (int $offset) use ($from, $views, $visitors) {
                    $day = $from->copy()->addDays($offset);
                    $date = $day->toDateString();

                    return [
                        // date is the key, label is what the chart shows; both
                        // are built here so the browser never has to parse a
                        // date-only string as UTC midnight.
                        'date' => $date,
                        'label' => $day->format('j M'),
                        'views' => (int) ($views[$date] ?? 0),
                        'visitors' => (int) ($visitors[$date] ?? 0),
                    ];
                })
                ->all();
        });
    }

    /**
     * @return list<array{path: string, views: int, visitors: int}>
     */
    private function topPages(string $from, string $to): array
    {
        return Cache::remember($this->cacheKey('pages', $from, $to), now()->addMinutes(5), function () use ($from, $to) {
            $views = DB::table('analytics_daily_pages')
                ->select('path', DB::raw('SUM(views) as views'))
                ->whereBetween('date', [$from, $to])
                ->groupBy('path')
                ->orderByDesc('views')
                ->orderBy('path')
                ->limit(10)
                ->get();

            if ($views->isEmpty()) {
                return [];
            }

            $visitors = DB::table('analytics_daily_page_visitors')
                ->select('path', DB::raw('COUNT(*) as visitors'))
                ->whereBetween('date', [$from, $to])
                ->whereIn('path', $views->pluck('path')->all())
                ->groupBy('path')
                ->pluck('visitors', 'path');

            return $views
                ->map(fn ($row) => [
                    'path' => (string) $row->path,
                    'views' => (int) $row->views,
                    'visitors' => (int) ($visitors[$row->path] ?? 0),
                ])
                ->all();
        });
    }

    /**
     * Breakdowns live in the raw table only, so they cannot reach further back
     * than the retention window. Past that the UI is told there is nothing to
     * show rather than being handed a misleading partial figure.
     */
    private function breakdownStart(Carbon $from): ?Carbon
    {
        if (! config('analytics.raw')) {
            return null;
        }

        $oldest = Carbon::now()->subDays((int) config('analytics.retention_days'))->startOfDay();

        return $from->lessThan($oldest) ? $oldest : $from;
    }

    /**
     * The denominator for the breakdown percentages.
     *
     * A breakdown can cover a shorter window than the headline totals, so
     * dividing it by totals.views would understate every share on a long period.
     * This is summed from the counters over exactly the window the breakdowns
     * were read from, which costs an index scan rather than touching raw events.
     */
    private function breakdownViews(Carbon $from, Carbon $to): int
    {
        return Cache::remember($this->cacheKey('breakdown-views', $from->toDateString(), $to->toDateString()), now()->addMinutes(5), fn () => (int) DB::table('analytics_daily_stats')
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->sum('views'));
    }

    /**
     * @return list<array{label: string, views: int}>
     */
    private function breakdown(string $column, Carbon $from, Carbon $to): array
    {
        // Whitelisted rather than interpolated from anything the client controls.
        $allowed = ['referrer_host', 'device_type', 'browser', 'os', 'locale'];

        if (! in_array($column, $allowed, true)) {
            return [];
        }

        return Cache::remember($this->cacheKey("breakdown:$column", $from->toDateString(), $to->toDateString()), now()->addMinutes(5), function () use ($column, $from, $to) {
            /** @var Collection<int, object{label: mixed, views: mixed}> $rows */
            $rows = DB::table('analytics_events')
                ->select($column.' as label', DB::raw('COUNT(*) as views'))
                ->where('recorded_at', '>=', $from)
                ->where('recorded_at', '<=', $to->copy()->endOfDay())
                ->whereNotNull($column)
                ->groupBy($column)
                ->orderByDesc('views')
                ->orderBy($column)
                ->limit(8)
                ->get();

            return $rows
                ->map(fn ($row) => [
                    'label' => $column === 'referrer_host' ? (string) $row->label : ucfirst((string) $row->label),
                    'views' => (int) $row->views,
                ])
                ->all();
        });
    }
}
