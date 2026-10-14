<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Message;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ContactAcknowledgementMail extends Mailable
{
    public function __construct(public readonly Message $contactMessage) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "We've received your message — Party Eden",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-acknowledgement',
        );
    }
}
