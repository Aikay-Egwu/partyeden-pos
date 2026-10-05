<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\DailyOrdersReportMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends daily pending orders report to admin.
 * Scheduled to run every morning to give fulfillment team visibility.
 */
class SendDailyOrdersReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $pendingOrders = Order::with(['customer', 'items.product'])
            ->whereIn('status', ['pending', 'preorder'])
            ->orderBy('placed_at', 'asc')
            ->get();

        if ($pendingOrders->isEmpty()) {
            return; // No pending orders, skip email
        }

        $adminEmail = config('mail.admin_email');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new DailyOrdersReportMail($pendingOrders));
        }
    }
}
