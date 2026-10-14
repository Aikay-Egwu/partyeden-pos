<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Message;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ContactReplyMail extends Mailable
{
    public function __construct(public readonly Message $contactMessage) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Re: Your Party Eden Enquiry',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-reply',
        );
    }
}
