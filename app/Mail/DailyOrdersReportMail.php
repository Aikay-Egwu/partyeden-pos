<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * Daily digest sent to admin with all pending/preorder orders.
 * Helps fulfillment team prioritize order processing.
 */
class DailyOrdersReportMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  Collection<int, Order>  $orders
     */
    public function __construct(public readonly Collection $orders) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Daily Orders Report — '.now()->format('d M Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.daily-orders-report',
        );
    }
}
