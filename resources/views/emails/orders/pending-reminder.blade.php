<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Pending Reminder</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #f59e0b; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 12px; background: #f3f4f6; color: #374151; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px; }
        .btn { display: inline-block; padding: 12px 24px; background: #f59e0b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 12px 0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>⏰ Your Order is Still Pending</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">Order {{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        
        <div class="info-box">
            <p style="margin:0;">We noticed your order placed <strong>{{ $order->placed_at?->diffForHumans() ?? 'recently' }}</strong> is still pending. Our team is working on confirming it!</p>
        </div>

        <p style="font-size:14px;">
            <strong>What happens next?</strong><br>
            • We'll verify your order details and payment<br>
            • You'll receive a confirmation email once approved<br>
            • Then we'll start preparing your balloons for {{ $order->fulfillment_type === 'delivery' ? 'delivery' : 'collection' }}
        </p>

        {{-- Order summary --}}
        <div class="section-title">Order Summary</div>
        <table>
            <tbody>
                <tr>
                    <td style="color:#6b7280">Order Number</td>
                    <td style="text-align:right;font-weight:600">{{ $order->order_number }}</td>
                </tr>
                <tr>
                    <td style="color:#6b7280">Placed</td>
                    <td style="text-align:right">{{ $order->placed_at?->format('d M Y, H:i') ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td style="color:#6b7280">Items</td>
                    <td style="text-align:right">{{ $order->items->count() }} item(s)</td>
                </tr>
                <tr>
                    <td style="color:#6b7280">Total</td>
                    <td style="text-align:right;font-weight:700">£{{ number_format((float)$order->total, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top:24px;text-align:center;">
            <a href="{{ config('app.url') }}/orders/{{ $order->id }}" class="btn">View Order Status</a>
        </div>

        <p style="margin-top:20px;font-size:14px;color:#6b7280;">
            <strong>Questions?</strong> Reply to this email or contact our support team. We're here to help!
        </p>
    </div>

    <div class="footer">
        Party Eden — Making every moment float ✨<br>
        <a href="{{ config('app.url') }}" style="color:#6b7280;">{{ config('app.url') }}</a>
    </div>
</div>
</body>
</html>
