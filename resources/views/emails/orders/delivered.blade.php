<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Delivered</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #10b981; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 12px; background: #f3f4f6; color: #374151; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .totals td { border-bottom: none; }
        .totals .grand-total { font-weight: 700; border-top: 2px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .highlight-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 4px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>✅ Order Delivered</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">Order {{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        
        <div class="highlight-box">
            <p style="margin:0;"><strong>Great news!</strong> Your order has been delivered. We hope you love your Party Eden balloons! 🎈</p>
        </div>

        {{-- Delivery details --}}
        <div class="section-title">Delivery Information</div>
        <p style="font-size:14px;">
            @if($order->fulfillment_type === 'delivery')
                🚚 <strong>Delivered to:</strong><br>
                @if($order->shipping_address_line1)
                    {{ $order->shipping_address_line1 }}<br>
                @endif
                @if($order->shipping_address_line2)
                    {{ $order->shipping_address_line2 }}<br>
                @endif
                @if($order->shipping_city)
                    {{ $order->shipping_city }}<br>
                @endif
                @if($order->delivery_postcode)
                    {{ $order->delivery_postcode }}
                @endif
            @else
                🏪 <strong>Collected from store</strong>
            @endif
        </p>

        {{-- Order items --}}
        <div class="section-title">Your Items</div>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align:right">Qty</th>
                    <th style="text-align:right">Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items->whereNull('parent_order_item_id') as $item)
                <tr>
                    <td>
                        {{ $item->product?->name ?? 'Item' }}
                        @if($item->customization_text)
                            <br><span style="color:#6b7280;font-size:12px;">✏️ "{{ $item->customization_text }}"</span>
                        @endif
                    </td>
                    <td style="text-align:right">{{ (float)$item->quantity }}</td>
                    <td style="text-align:right">£{{ number_format((float)$item->unit_price, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- Totals --}}
        <table class="totals" style="margin-top:12px;max-width:240px;margin-left:auto;">
            <tr><td style="color:#6b7280">Subtotal</td><td style="text-align:right">£{{ number_format((float)$order->subtotal, 2) }}</td></tr>
            @if((float)$order->shipping_amount > 0)
            <tr><td style="color:#6b7280">Shipping</td><td style="text-align:right">£{{ number_format((float)$order->shipping_amount, 2) }}</td></tr>
            @endif
            <tr class="grand-total"><td>Total Paid</td><td style="text-align:right">£{{ number_format((float)$order->total, 2) }}</td></tr>
        </table>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="font-size:14px;color:#6b7280;margin:0;">
                <strong>💝 Enjoy your celebration!</strong><br>
                We'd love to see your party photos. Tag us @partyeden on Instagram!
            </p>
        </div>

        <p style="margin-top:20px;font-size:14px;">
            Need assistance? Reply to this email or contact our support team.
        </p>
    </div>

    <div class="footer">
        Party Eden — Making every moment float ✨<br>
        <a href="{{ config('app.url') }}" style="color:#6b7280;">{{ config('app.url') }}</a>
    </div>
</div>
</body>
</html>
