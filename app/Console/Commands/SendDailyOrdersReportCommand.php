<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendDailyOrdersReport;
use Illuminate\Console\Command;

/**
 * Artisan command to send daily pending orders report to admin.
 * Scheduled to run every morning via console kernel.
 */
class SendDailyOrdersReportCommand extends Command
{
    protected $signature = 'orders:send-daily-report';

    protected $description = 'Send daily report of pending orders to admin';

    public function handle(): int
    {
        $this->info('Dispatching daily orders report...');

        SendDailyOrdersReport::dispatch();

        $this->info('Daily orders report queued successfully.');

        return Command::SUCCESS;
    }
}
