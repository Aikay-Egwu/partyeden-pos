<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\OrderStatusMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends a status-update email to the customer
 * whenever an admin transitions the order to a new status.
 * Dispatched by the OrderStatusChanged event listener.
 */
class SendOrderStatusEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $previousStatus,
    ) {}

    public function handle(): void
    {
        $this->order->loadMissing(['customer']);

        $customerEmail = $this->order->customer?->email;

        if (! $customerEmail) {
            return;
        }

        Mail::to($customerEmail)->send(
            new OrderStatusMail($this->order, $this->previousStatus),
        );
    }
}
