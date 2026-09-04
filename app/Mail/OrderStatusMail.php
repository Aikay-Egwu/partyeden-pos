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
 * Sent to the customer whenever their order status is updated by an admin.
 */
class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $previousStatus,
    ) {}

    public function envelope(): Envelope
    {
        $status = ucfirst($this->order->status);

        return new Envelope(
            subject: "Your Order {$this->order->order_number} — {$status}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.status-update',
        );
    }
}
