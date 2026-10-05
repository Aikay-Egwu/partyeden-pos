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
 * Sent to customers 2-3 days after order delivery.
 * Requests feedback/review to improve service quality.
 */
class FeedbackRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'How Did We Do? Share Your Party Eden Experience',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.feedback-request',
        );
    }
}
