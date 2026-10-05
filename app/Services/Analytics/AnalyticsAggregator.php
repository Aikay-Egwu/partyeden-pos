<?php

namespace App\Services\Analytics;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Turns one captured page view into rows.
 *
 * Runs after the response has been sent, so the cost of these statements is
 * invisible to the visitor. Every write here is a point write against a primary
 * key or a unique index; there is not a single SELECT, because a read on the
 * write path is how an analytics feature eventually slows down the site it is
 * measuring. Anything that needs to scan is deferred to the dashboard, which is
 * read by one person and cached.
 *
 * Failures are swallowed by design and logged at debug: losing a page view is
 * acceptable, breaking a page is not.
 */
class AnalyticsAggregator
{
    /**
     * @param  array<string, mixed>  $event
     */
    public function ingest(array $event): void
    {
        if (! $this->isWellFormed($event)) {
            return;
        }

        $isNew = $this->classifyNewVisitor($event);

        try {
            $this->record($event, $isNew, (bool) config('analytics.raw') && (bool) config('analytics.enabled'));
        } catch (Throwable $e) {
            logger()->debug('Analytics write dropped.', ['reason' => $e->getMessage()]);
        }
    }

    /**
     * Rebuild the daily counters for one historical event. Used by
     * analytics:backfill, which must never duplicate raw rows and cannot
     * reconstruct the new/returning classification after the cache has moved on.
     *
     * @param  array<string, mixed>  $event
     */
    public function rebuild(array $event): void
    {
        if (! $this->isWellFormed($event)) {
            return;
        }

        $this->record($event, null, false);
    }

    /**
     * One transaction for the whole fan-out: on MySQL and SQLite a commit is one
     * durable flush, whereas six autocommitted statements would be six. Losing
     * atomicity would be acceptable for telemetry - these are counters, not
     * money - but it would also be slower, so there is no trade-off to make.
     *
     * @param  bool|null  $isNew  null means "not measured"
     * @param  bool  $raw  whether the event row itself should be stored
     * @param  array<string, mixed>  $event
     */
    private function record(array $event, ?bool $isNew, bool $raw): void
    {
        $date = Carbon::parse($event['recorded_at'])->toDateString();
        $shard = $this->shard($event['visit_hash']);
        $rollups = config('analytics.rollups') === 'inline';
        $stamp = now()->toDateTimeString();

        DB::transaction(function () use ($event, $date, $shard, $isNew, $raw, $rollups, $stamp) {
            if ($raw) {
                DB::table('analytics_events')->insert([
                    'visit_hash' => $event['visit_hash'],
                    'kind' => $event['kind'],
                    'path' => $event['path'],
                    'referrer_host' => $event['referrer_host'],
                    'browser' => $event['browser'] ?? null,
                    'os' => $event['os'] ?? null,
                    'device_type' => $event['device_type'] ?? null,
                    'locale' => $event['locale'] ?? null,
                    'country' => $event['country'] ?? null,
                    'is_new_visitor' => $isNew,
                    'viewport_width' => $event['viewport_width'] ?? null,
                    'viewport_height' => $event['viewport_height'] ?? null,
                    'duration_ms' => $event['duration_ms'] ?? null,
                    'properties' => isset($event['properties']) ? json_encode($event['properties']) : null,
                    'recorded_at' => $event['recorded_at'],
                    'created_at' => $stamp,
                    'updated_at' => $stamp,
                ]);
            }

            if (! $rollups) {
                return;
            }

            $this->bump('analytics_daily_stats', ['date' => $date, 'shard' => $shard], ['views' => 1] + ($isNew ? ['new_visitors' => 1] : []));

            $this->bump('analytics_daily_pages', ['date' => $date, 'path' => $event['path'], 'shard' => $shard], ['views' => 1]);

            // Ledgers: insert-or-ignore is the whole counting strategy. A repeat
            // visit hits the unique key, is ignored, and contributes no extra
            // unique - which is exactly what "unique" means. The country therefore
            // belongs to the first view of the day; that is deliberate, because
            // filling it in later would need a read or a blind write on every
            // repeat view, and it can only differ if geolocation itself changed.
            DB::table('analytics_daily_visitors')->insertOrIgnore([
                'date' => $date,
                'visit_hash' => $event['visit_hash'],
                'country' => $event['country'] ?? null,
                'first_seen_at' => $event['recorded_at'],
            ]);

            DB::table('analytics_daily_page_visitors')->insertOrIgnore([
                'date' => $date,
                'path' => $event['path'],
                'visit_hash' => $event['visit_hash'],
            ]);
        });
    }

    /**
     * @param  array<string, int>  $increments
     * @param  array<string, mixed>  $key
     */
    private function bump(string $table, array $key, array $increments): void
    {
        // Insert-then-increment instead of an upsert-with-expression, because the
        // SQL for the latter differs across MySQL, Postgres and SQLite while this
        // ordering is race-free: the row always exists before the arithmetic, the
        // arithmetic is performed by the database, and every other column lands on
        // its schema default of zero.
        DB::table($table)->insertOrIgnore($key);

        $set = [];

        foreach ($increments as $column => $amount) {
            $set[$column] = DB::raw($column.' + '.(int) $amount);
        }

        DB::table($table)->where($key)->update($set);
    }

    /**
     * A pseudonym that never leaves the cache. Storing only the resulting boolean
     * means the database still cannot tell you that two visits were the same
     * person, even though the cache temporarily can.
     *
     * @param  array<string, mixed>  $event
     */
    private function classifyNewVisitor(array $event): ?bool
    {
        if (! config('analytics.track_returning') || ! isset($event['cohort_key'])) {
            return null;
        }

        return Cache::add(
            'analytics:seen:'.$event['cohort_key'],
            1,
            Carbon::now()->addDays(max(1, (int) config('analytics.returning_lookback_days'))),
        );
    }

    /**
     * @param  array<string, mixed>  $event
     */
    private function isWellFormed(array $event): bool
    {
        return isset($event['visit_hash'], $event['path'], $event['recorded_at'])
            && is_string($event['visit_hash'])
            && is_string($event['path'])
            && ($event['kind'] ?? 'page_view') === 'page_view';
    }

    private function shard(string $visitHash): int
    {
        $shards = max(1, (int) config('analytics.shards'));

        return $shards === 1 ? 0 : (int) (crc32($visitHash) % $shards);
    }
}
