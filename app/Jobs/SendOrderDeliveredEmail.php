<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\OrderDeliveredMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends delivery confirmation email to customer.
 * Triggered when order status changes to "delivered".
 */
class SendOrderDeliveredEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function handle(): void
    {
        $this->order->loadMissing([
            'customer',
            'items.product',
            'deliveryZone',
        ]);

        $customerEmail = $this->order->customer?->email;
        if ($customerEmail) {
            Mail::to($customerEmail)->send(new OrderDeliveredMail($this->order));
        }
    }
}
