<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Message;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NewMessageNotificationMail extends Mailable
{
    public function __construct(public readonly Message $contactMessage) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Contact Message — '.$this->contactMessage->first_name.' '.$this->contactMessage->last_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-message-notification',
        );
    }
}
