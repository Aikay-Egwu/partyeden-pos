<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payment Received</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #059669; color: #fff; padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 6px 0 0; opacity: .9; font-size: 15px; }
        .content { padding: 32px; }
        .paid-badge { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 700; font-size: 14px; padding: 6px 14px; border-radius: 999px; margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 10px; background: #f9fafb; color: #374151; font-weight: 600; }
        td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
        .totals td { border-bottom: none; padding: 6px 10px; }
        .totals .grand-total { font-weight: 700; font-size: 16px; border-top: 2px solid #e5e7eb; color: #111827; }
        .footer { background: #f9fafb; padding: 20px 32px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>✅ Payment Confirmed</h1>
        <p>Order #{{ $order->order_number }}</p>
    </div>

    <div class="content">
        <div style="text-align: center;">
            <span class="paid-badge">Paid £{{ number_format((float) $order->amount_paid, 2) }}</span>
        </div>

        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        <p>We've received your payment! Your order is now confirmed and our team will prepare everything for you.</p>

        {{-- Fulfillment Details --}}
        <div class="section-title">Fulfillment</div>
        <p style="font-size: 14px; margin: 4px 0;">
            @if($order->fulfillment_type === 'delivery')
                🚚 <strong>Delivery</strong>
                @if($order->shipping_address_line1)
                    <br>{{ $order->shipping_address_line1 }}
                    @if($order->shipping_address_line2)<br>{{ $order->shipping_address_line2 }}@endif
                    @if($order->shipping_city)<br>{{ $order->shipping_city }}@endif
                    @if($order->delivery_postcode)<br><strong>{{ $order->delivery_postcode }}</strong>@endif
                @elseif($order->delivery_postcode)
                    to postcode <strong>{{ $order->delivery_postcode }}</strong>
                @endif
            @else
                🏪 <strong>Store Collection / Pickup</strong>
            @endif
        </p>

        @if($order->expected_at)
            <p style="font-size: 14px; margin: 6px 0;">
                <strong>Expected Date & Time:</strong>
                {{ $order->expected_at->timezone(config('checkout.timezone', 'Europe/London'))->format('l, d M Y at H:i') }}
            </p>
        @endif

        {{-- Order Items --}}
        <div class="section-title">Order Items</div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align:right">Qty</th>
                    <th style="text-align:right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product_name }}</strong>
                            @if($item->customization_text)
                                <div style="font-size:12px;color:#6b7280;">Custom text: "{{ $item->customization_text }}"</div>
                            @endif
                        </td>
                        <td style="text-align:right; vertical-align: top;">{{ (int) $item->quantity }}</td>
                        <td style="text-align:right; vertical-align: top;">£{{ number_format((float) $item->total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
            <tbody class="totals">
                <tr>
                    <td colspan="2" style="text-align:right">Subtotal:</td>
                    <td style="text-align:right">£{{ number_format((float) $order->subtotal, 2) }}</td>
                </tr>
                @if((float) $order->shipping_amount > 0)
                    <tr>
                        <td colspan="2" style="text-align:right">Delivery:</td>
                        <td style="text-align:right">£{{ number_format((float) $order->shipping_amount, 2) }}</td>
                    </tr>
                @endif
                <tr class="grand-total">
                    <td colspan="2" style="text-align:right">Amount Paid:</td>
                    <td style="text-align:right">£{{ number_format((float) $order->amount_paid, 2) }}</td>
                </tr>
            </tbody>
        </table>

        @if($order->notes)
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; font-size: 13px; color: #374151; margin-top: 20px;">
                <strong>Special Instructions:</strong><br>
                {!! nl2br(e($order->notes)) !!}
            </div>
        @endif
    </div>

    <div class="footer">
        <p>Party Eden — Balloons & Event Decor</p>
        <p>Thank you for choosing Party Eden!</p>
    </div>
</div>
</body>
</html>
