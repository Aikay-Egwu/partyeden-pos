<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendOrderPendingReminder;
use App\Models\Order;
use Illuminate\Console\Command;

/**
 * Artisan command to send reminders for orders pending > 24 hours.
 * Scheduled to run daily via console kernel.
 */
class SendPendingOrderRemindersCommand extends Command
{
    protected $signature = 'orders:send-pending-reminders';

    protected $description = 'Send reminders to customers with orders pending for over 24 hours';

    public function handle(): int
    {
        $this->info('Checking for orders pending > 24 hours...');

        $cutoff = now()->subHours(24);

        $orders = Order::where('status', 'pending')
            ->where('placed_at', '<=', $cutoff)
            ->whereNotNull('customer_id')
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No pending orders older than 24 hours.');

            return Command::SUCCESS;
        }

        $this->info("Found {$orders->count()} orders pending > 24h. Dispatching reminders...");

        foreach ($orders as $order) {
            SendOrderPendingReminder::dispatch($order);
        }

        $this->info("Queued {$orders->count()} reminder emails.");

        return Command::SUCCESS;
    }
}
