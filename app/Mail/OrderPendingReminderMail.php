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
 * Sent to customers 24 hours after order placement if still pending.
 * Gentle reminder to complete any missing information or follow up.
 */
class OrderPendingReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Order {$this->order->order_number} is Still Pending",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.pending-reminder',
        );
    }
}
