<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to the customer after their Stripe Payment Link payment is confirmed via webhook.
 */
class StoreOrderPaymentReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payment Confirmed! Your Order #{$this->order->order_number} is Secured",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.payment-received',
        );
    }
}
