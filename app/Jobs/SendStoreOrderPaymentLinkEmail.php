<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\StoreOrderPaymentLinkMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends the Stripe Payment Link email to the customer.
 */
class SendStoreOrderPaymentLinkEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function handle(): void
    {
        $this->order->loadMissing([
            'customer',
            'items.product',
            'items.customizationPrimaryColor',
            'items.customizationSecondaryColor',
            'deliveryZone',
        ]);

        $customerEmail = $this->order->customer?->email;

        if (! $customerEmail) {
            Log::info('Skipped sending payment link email: customer has no email', [
                'order_id' => $this->order->id,
            ]);

            return;
        }

        if (! $this->order->stripe_payment_link_url) {
            Log::warning('Skipped sending payment link email: order has no payment link URL', [
                'order_id' => $this->order->id,
            ]);

            return;
        }

        Mail::to($customerEmail)->send(new StoreOrderPaymentLinkMail($this->order));

        Log::info('Payment link email sent to customer', [
            'order_id' => $this->order->id,
            'email' => $customerEmail,
        ]);
    }
}
