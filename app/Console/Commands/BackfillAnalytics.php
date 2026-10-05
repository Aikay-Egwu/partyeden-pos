<?php

namespace App\Console\Commands;

use App\Services\Analytics\AnalyticsAggregator;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillAnalytics extends Command
{
    protected $signature = 'analytics:backfill
                            {--from= : First event date to rebuild, default oldest stored event}
                            {--to= : Last event date to rebuild, default today}
                            {--chunk=250 : Events replayed per transaction}
                            {--force : Replay even though the counters already hold data}';

    protected $description = 'Rebuild the daily counters from stored analytics_events rows';

    public function handle(AnalyticsAggregator $aggregator): int
    {
        if (config('analytics.rollups') !== 'inline') {
            $this->error('ANALYTICS_ROLLUPS is not set to "inline", so there are no counters to rebuild.');

            return self::FAILURE;
        }

        $from = $this->option('from') ? Carbon::parse((string) $this->option('from'))->startOfDay() : null;
        $to = $this->option('to') ? Carbon::parse((string) $this->option('to'))->endOfDay() : Carbon::now()->endOfDay();

        // Counters are incremented, never replaced, so replaying over a period
        // they already cover would add a second count to every view in it.
        // Narrowing --from does not make that safe - it just hides which days
        // were inflated - so the guard applies whenever they hold any data.
        $existing = DB::table('analytics_daily_pages')->max('date');

        if ($existing !== null && ! $this->option('force')) {
            $this->error("The daily counters already hold data through {$existing}.");
            $this->line('Replaying events adds to those counts rather than replacing them, so the result');
            $this->line('would be double counted. Truncate analytics_daily_stats, analytics_daily_pages,');
            $this->line('analytics_daily_visitors and analytics_daily_page_visitors first, then re-run.');
            $this->line('');
            $this->line('Pass --force only if you know the overlap is what you want.');

            return self::FAILURE;
        }

        $oldest = $from;

        if ($oldest === null) {
            $earliest = DB::table('analytics_events')->min('recorded_at');
            $oldest = $earliest === null ? null : Carbon::parse((string) $earliest)->startOfDay();
        }

        if ($oldest === null) {
            $this->info('No stored events to replay.');

            return self::SUCCESS;
        }

        $this->line(sprintf('Replaying events from %s to %s.', $oldest->toDateString(), $to->toDateString()));

        $replayed = 0;
        $chunkSize = max(1, (int) $this->option('chunk'));

        // Ordered by id rather than date so the scan rides the primary key and the
        // loop can page forward with a simple cursor instead of OFFSET, which
        // degrades quadratically on a large table.
        $cursor = 0;

        while (true) {
            $events = DB::table('analytics_events')
                ->where('id', '>', $cursor)
                ->whereBetween('recorded_at', [$oldest->toDateTimeString(), $to->toDateTimeString()])
                ->orderBy('id')
                ->limit($chunkSize)
                ->get();

            if ($events->isEmpty()) {
                break;
            }

            // One transaction per chunk: a failure rolls back that chunk only, so
            // re-running after fixing the cause resumes from committed progress.
            DB::transaction(function () use ($events, $aggregator, &$replayed) {
                foreach ($events as $event) {
                    $aggregator->rebuild((array) $event);
                    $replayed++;
                }
            });

            $cursor = (int) $events->last()->id;

            // A dot per chunk: enough to prove a long replay has not hung, without
            // an extra COUNT(*) over the table just to size a progress bar.
            $this->output->write('.');
        }

        $this->newLine();
        $this->info(sprintf('Rebuilt daily counters from %s stored events.', number_format($replayed)));
        $this->line('New/returning classification cannot be reconstructed and stays at zero.');

        return self::SUCCESS;
    }
}
