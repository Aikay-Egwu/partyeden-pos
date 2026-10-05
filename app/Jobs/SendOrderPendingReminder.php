<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\OrderPendingReminderMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends reminder to customers with pending orders after 24h.
 * Helps reduce abandoned/incomplete orders.
 */
class SendOrderPendingReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function handle(): void
    {
        $this->order->loadMissing([
            'customer',
            'items.product',
        ]);

        $customerEmail = $this->order->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new OrderPendingReminderMail($this->order));
        }
    }
}
