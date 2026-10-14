<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reply from Party Eden</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #7c3aed; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .reply-box { background: #f3f0ff; border-left: 4px solid #7c3aed; border-radius: 6px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 16px 0; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Reply from Party Eden</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">Regarding your enquiry</p>
    </div>

    <div class="content">
        <p>Hi {{ $contactMessage->first_name }},</p>
        <p>Thank you for your enquiry. Here's our response:</p>

        <div class="reply-box">{{ $contactMessage->admin_reply }}</div>

        <p>If you have any further questions, feel free to reply to this email or call us on <a href="tel:01915659575">0191 565 9575</a>.</p>

        <p>Kind regards,<br><strong>The Party Eden Team</strong></p>
    </div>

    <div class="footer">
        <p>Party Eden — Bespoke Balloon Boutique</p>
        <p>203 High Street West, Sunniside, Sunderland, SR1 1UA</p>
    </div>
</div>
</body>
</html>
