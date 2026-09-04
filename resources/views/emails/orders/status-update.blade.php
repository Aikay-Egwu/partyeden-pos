<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Update</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #1a1a2e; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .status-box { display:inline-block; padding:6px 16px; border-radius:6px; background:#d1fae5; color:#065f46; font-weight:700; font-size:15px; text-transform:capitalize; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Order Update</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">{{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        <p>Your order status has been updated:</p>

        <p>
            <span style="color:#6b7280;text-decoration:line-through;font-size:14px;">{{ ucfirst($previousStatus) }}</span>
            &rarr;
            <span class="status-box">{{ ucfirst($order->status) }}</span>
        </p>

        @php
        $messages = [
            'confirmed'  => 'Great news — your order has been confirmed and is being prepared.',
            'preparing'  => 'Our team is now preparing your order.',
            'ready'      => 'Your order is ready! We\'ll be in touch with collection or delivery details.',
            'dispatched' => 'Your order is on its way! 🚚',
            'delivered'  => 'Your order has been delivered. We hope you love it!',
            'cancelled'  => 'Your order has been cancelled. If you have questions, please get in touch.',
        ];
        $message = $messages[$order->status] ?? 'We\'ll keep you updated as things progress.';
        @endphp

        <p>{{ $message }}</p>

        <p style="font-size:13px;color:#6b7280;">
            Order: <strong>{{ $order->order_number }}</strong><br>
            Placed: {{ $order->placed_at?->format('d M Y, H:i') ?? $order->created_at->format('d M Y, H:i') }}
        </p>

        <p style="margin-top:24px;font-size:13px;color:#6b7280;">
            If you have any questions, simply reply to this email.<br>
            Thank you for choosing Party Eden!
        </p>
    </div>

    <div class="footer">
        © {{ date('Y') }} Party Eden. All rights reserved.
    </div>
</div>
</body>
</html>
