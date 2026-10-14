<?php

return [
    // Business WhatsApp number in international format without "+" or spaces
    // (e.g. 447700900123 for a UK number). Empty means WhatsApp is not configured.
    'number' => env('WHATSAPP_NUMBER', ''),

    // Default message pre-filled when a visitor opens the chat from a banner.
    'default_message' => env('WHATSAPP_DEFAULT_MESSAGE', 'Hi! I would like something bespoke, let us discuss further.'),
];
