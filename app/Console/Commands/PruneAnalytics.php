<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneAnalytics extends Command
{
    protected $signature = 'analytics:prune
                            {--days= : Override ANALYTICS_RETENTION_DAYS for raw events}
                            {--ledger-days= : Override ANALYTICS_LEDGER_RETENTION_DAYS for visitor ledgers}
                            {--chunk=1000 : Rows deleted per statement}
                            {--dry-run : Report what would be deleted without deleting it}';

    protected $description = 'Delete expired analytics rows, oldest first, in bounded chunks';

    public function handle(): int
    {
        $chunk = max(1, (int) $this->option('chunk'));
        $dryRun = (bool) $this->option('dry-run');

        $eventCutoff = $this->cutoff($this->option('days'), (int) config('analytics.retention_days'));
        $ledgerCutoff = $this->cutoff($this->option('ledger-days'), (int) config('analytics.ledger_retention_days'));

        // Deleting straight from analytics_events would take a single long row
        // lock across everything it removes, which on a busy site is how a
        // housekeeping job becomes a stalled write queue behind live traffic.
        //
        // Each comparison value is formatted for the column it is compared
        // against: a datetime against recorded_at, a bare date against the
        // ledger date columns. Passing a datetime to a date column silently
        // deletes one extra day on SQLite, where both sides are strings.
        //
        // analytics_daily_stats and analytics_daily_pages are deliberately never
        // pruned. They are a handful of rows per day, they hold no pseudonyms,
        // and they are the only long-term trend the dashboard can show once the
        // raw events behind a period have expired.
        $events = $this->deleteInChunks('analytics_events', 'recorded_at', $eventCutoff->toDateTimeString(), $chunk, $dryRun);
        $visitors = $this->deleteInChunks('analytics_daily_visitors', 'date', $ledgerCutoff->toDateString(), $chunk, $dryRun);
        $pages = $this->deleteInChunks('analytics_daily_page_visitors', 'date', $ledgerCutoff->toDateString(), $chunk, $dryRun);

        $this->info(sprintf(
            '%s %s raw events, %s visitor rows, %s page-visitor rows (events before %s, ledgers before %s).',
            $dryRun ? 'Would delete' : 'Deleted',
            number_format($events),
            number_format($visitors),
            number_format($pages),
            $eventCutoff->toDateString(),
            $ledgerCutoff->toDateString(),
        ));

        return self::SUCCESS;
    }

    private function cutoff(mixed $override, int $configured): Carbon
    {
        $days = $override === null || $override === '' ? $configured : max(0, (int) $override);

        return Carbon::now()->subDays($days)->startOfDay();
    }

    /**
     * Selects a bounded slice of ids and deletes by primary key, rather than
     * issuing one large DELETE, so no single statement holds a long lock.
     */
    private function deleteInChunks(string $table, string $column, string $cutoff, int $chunk, bool $dryRun): int
    {
        $query = fn () => DB::table($table)->where($column, '<', $cutoff);

        if ($dryRun) {
            return $query()->count();
        }

        $deleted = 0;

        do {
            $ids = $query()->orderBy('id')->limit($chunk)->pluck('id')->all();

            if ($ids === []) {
                break;
            }

            $deleted += DB::table($table)->whereIn('id', $ids)->delete();
        } while (count($ids) === $chunk);

        return $deleted;
    }
}
