<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SendFeedbackRequestEmail;
use App\Models\Order;
use Illuminate\Console\Command;

/**
 * Artisan command to send feedback requests for delivered orders.
 * Targets orders delivered 2-3 days ago. Scheduled daily via console kernel.
 */
class SendFeedbackRequestsCommand extends Command
{
    protected $signature = 'orders:send-feedback-requests';

    protected $description = 'Send feedback requests to customers whose orders were delivered 2-3 days ago';

    public function handle(): int
    {
        $this->info('Checking for delivered orders ready for feedback request...');

        // Target orders delivered 2-3 days ago (give them time to use the product)
        $twoDaysAgo = now()->subDays(3);
        $threeDaysAgo = now()->subDays(2);

        $orders = Order::where('status', 'delivered')
            ->whereBetween('updated_at', [$twoDaysAgo, $threeDaysAgo])
            ->whereNotNull('customer_id')
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No delivered orders in feedback window (2-3 days ago).');

            return Command::SUCCESS;
        }

        $this->info("Found {$orders->count()} delivered orders. Dispatching feedback requests...");

        foreach ($orders as $order) {
            SendFeedbackRequestEmail::dispatch($order);
        }

        $this->info("Queued {$orders->count()} feedback request emails.");

        return Command::SUCCESS;
    }
}
