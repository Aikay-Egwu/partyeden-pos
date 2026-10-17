<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Complete Your Order Payment</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #e11d48; color: #fff; padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 6px 0 0; opacity: .9; font-size: 15px; }
        .content { padding: 32px; }
        .cta-container { text-align: center; margin: 28px 0; }
        .pay-button { display: inline-block; background-color: #e11d48; color: #ffffff !important; padding: 14px 32px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(225,29,72,0.3); }
        .pay-button:hover { background-color: #be123c; }
        .section-title { font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 10px; background: #f9fafb; color: #374151; font-weight: 600; }
        td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
        .totals td { border-bottom: none; padding: 6px 10px; }
        .totals .grand-total { font-weight: 700; font-size: 16px; border-top: 2px solid #e5e7eb; color: #111827; }
        .note-box { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 14px; font-size: 13px; color: #991b1b; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px 32px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🎈 Complete Your Order</h1>
        <p>Order #{{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        <p>Thank you for placing your order with <strong>Party Eden</strong>! To confirm your booking and secure your items, please complete your payment via our secure Stripe checkout.</p>

        @if($order->stripe_payment_link_url)
            <div class="cta-container">
                <a href="{{ $order->stripe_payment_link_url }}" class="pay-button" target="_blank">
                    Pay Now (£{{ number_format((float) $order->total, 2) }})
                </a>
                <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                    Or copy this link: <br>
                    <a href="{{ $order->stripe_payment_link_url }}" style="color: #e11d48; word-break: break-all;">{{ $order->stripe_payment_link_url }}</a>
                </p>
            </div>
        @endif

        {{-- Fulfillment Summary --}}
        <div class="section-title">Fulfillment Details</div>
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
        <div class="section-title">Order Summary</div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align:right">Qty</th>
                    <th style="text-align:right">Price</th>
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
                            @if($item->customizationPrimaryColor)
                                <div style="font-size:12px;color:#6b7280;">Main color: {{ $item->customizationPrimaryColor->name }}</div>
                            @endif
                            @if($item->customizationSecondaryColor)
                                <div style="font-size:12px;color:#6b7280;">Secondary color: {{ $item->customizationSecondaryColor->name }}</div>
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
                @if((float) $order->discount_amount > 0)
                    <tr>
                        <td colspan="2" style="text-align:right">Discount:</td>
                        <td style="text-align:right">-£{{ number_format((float) $order->discount_amount, 2) }}</td>
                    </tr>
                @endif
                <tr class="grand-total">
                    <td colspan="2" style="text-align:right">Total:</td>
                    <td style="text-align:right">£{{ number_format((float) $order->total, 2) }}</td>
                </tr>
            </tbody>
        </table>

        @if($order->notes)
            <div class="note-box">
                <strong>Order Instructions:</strong><br>
                {!! nl2br(e($order->notes)) !!}
            </div>
        @endif
    </div>

    <div class="footer">
        <p>Party Eden — Balloons & Event Decor</p>
        <p>If you have any questions, reply to this email or contact us via WhatsApp.</p>
    </div>
</div>
</body>
</html>
