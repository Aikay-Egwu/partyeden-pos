<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendDailyOrdersReport;
use Illuminate\Console\Command;

/**
 * Artisan command to send the daily orders digest to admin.
 * Lists orders due today followed by upcoming orders.
 * Scheduled to run every morning via routes/console.php.
 */
class SendDailyOrdersReportCommand extends Command
{
    protected $signature = 'orders:send-daily-report';

    protected $description = 'Send daily orders digest (today + upcoming) to admin';

    public function handle(): int
    {
        $this->info('Dispatching daily orders report...');

        SendDailyOrdersReport::dispatch();

        $this->info('Daily orders report queued successfully.');

        return Command::SUCCESS;
    }
}
