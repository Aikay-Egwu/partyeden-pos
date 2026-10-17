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
 * Sent to the customer with their Stripe Payment Link to pay for a phone/WhatsApp order.
 */
class StoreOrderPaymentLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Complete Your Order Payment — {$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.payment-link',
        );
    }
}
