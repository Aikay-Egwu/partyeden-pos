<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Share Your Feedback</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .btn { display: inline-block; padding: 14px 28px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
        .stars { font-size: 32px; margin: 16px 0; }
        .highlight { background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 16px; margin: 16px 0; border-radius: 4px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>💜 How Did We Do?</h1>
        <p style="margin:4px 0 0;opacity:.9;font-size:14px;">Your feedback helps us celebrate better</p>
    </div>

    <div class="content">
        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        
        <p>We hope your Party Eden balloons made your celebration extra special! 🎈✨</p>

        <div class="highlight">
            <p style="margin:0;font-size:14px;">
                <strong>Order {{ $order->order_number }}</strong> was delivered on {{ $order->updated_at?->format('d M Y') ?? 'recently' }}.
            </p>
        </div>

        <p style="font-size:14px;">
            We'd love to hear about your experience! Your feedback helps us:
        </p>
        <ul style="font-size:14px;color:#4b5563;line-height:1.8;">
            <li>Improve our balloon quality and designs</li>
            <li>Perfect our delivery service</li>
            <li>Create even more magical moments for future customers</li>
        </ul>

        <div class="stars" style="text-align:center;">
            ⭐ ⭐ ⭐ ⭐ ⭐
        </div>

        <div style="text-align:center;margin:24px 0;">
            <a href="{{ config('app.url') }}/reviews/create?order_id={{ $order->id }}" class="btn">
                Leave a Review
            </a>
        </div>

        <p style="font-size:14px;color:#6b7280;text-align:center;">
            It only takes 2 minutes, and we read every single review! 💌
        </p>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="font-size:14px;color:#6b7280;margin:0;">
                <strong>📸 Love your balloons?</strong><br>
                Share your party photos on Instagram and tag <strong>@partyeden</strong> — we'd love to see them!
            </p>
        </div>

        <p style="margin-top:20px;font-size:14px;">
            Thank you for choosing Party Eden. We can't wait to celebrate with you again! 🎉
        </p>
    </div>

    <div class="footer">
        Party Eden — Making every moment float ✨<br>
        <a href="{{ config('app.url') }}" style="color:#6b7280;">{{ config('app.url') }}</a>
    </div>
</div>
</body>
</html>
