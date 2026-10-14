<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>We've Received Your Message</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #7c3aed; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; font-size: 14px; line-height: 1.6; }
        .contact-link { display:inline-block; margin-top:16px; padding:10px 24px; background:#7c3aed; color:#fff; text-decoration:none; border-radius:6px; font-weight:600; font-size:14px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Thank you, {{ $contactMessage->first_name }}!</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">We've received your message</p>
    </div>

    <div class="content">
        <p>Hi {{ $contactMessage->first_name }},</p>
        <p>Thanks for getting in touch with Party Eden. We've received your message and our team will get back to you as soon as possible — usually within 24 hours during business days.</p>

        @if($contactMessage->event_type || $contactMessage->event_date)
        <p style="font-size:14px;color:#6b7280;margin-top:20px;">
            <strong>Your enquiry:</strong>
            @if($contactMessage->event_type) {{ $contactMessage->event_type }}@endif
            @if($contactMessage->event_date) — {{ $contactMessage->event_date->format('d M Y') }}@endif
        </p>
        @endif

        <div class="message-box" style="margin-top:12px;">
            "{{ $contactMessage->message }}"
        </div>

        <p style="margin-top:20px;font-size:14px;">In the meantime, feel free to browse our collections or give us a call:</p>
        <p style="font-size:14px;">
            📞 <a href="tel:01915659575">0191 565 9575</a><br>
            📧 <a href="mailto:info@partyeden.co.uk">info@partyeden.co.uk</a>
        </p>

        <a href="https://partyeden.co.uk" class="contact-link">Browse Our Collections</a>
    </div>

    <div class="footer">
        <p>Party Eden — Bespoke Balloon Boutique</p>
        <p>203 High Street West, Sunniside, Sunderland, SR1 1UA</p>
        <p>This is an automated confirmation. Please reply to this email or contact us directly for further enquiries.</p>
    </div>
</div>
</body>
</html>
