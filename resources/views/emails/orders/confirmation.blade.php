<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #1a1a2e; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 12px; background: #f3f4f6; color: #374151; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .totals td { border-bottom: none; }
        .totals .grand-total { font-weight: 700; border-top: 2px solid #e5e7eb; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #065f46; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🎉 Order Confirmed</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">Order {{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>Hi {{ $order->customer?->first_name ?? 'there' }},</p>
        <p>Thank you for your order! We've received it and will be in touch soon.</p>

        {{-- Fulfillment method --}}
        <div class="section-title">Fulfillment</div>
        <p style="font-size:14px;">
            @if($order->fulfillment_type === 'delivery')
                🚚 <strong>Delivery</strong>
                @if($order->delivery_postcode) to postcode <strong>{{ $order->delivery_postcode }}</strong>@endif
                @if($order->deliveryZone) ({{ $order->deliveryZone->name }})@endif
            @else
                🏪 <strong>Collection / Pickup</strong>
            @endif
        </p>

        {{-- Order items --}}
        <div class="section-title">Items</div>
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
                        @if($item->customizationPrimaryColor)
                            <br><span style="color:#6b7280;font-size:12px;">🎨 {{ $item->customizationPrimaryColor->name }}</span>
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
            @if((float)$order->discount_amount > 0)
            <tr><td style="color:#059669">Discount</td><td style="text-align:right;color:#059669">-£{{ number_format((float)$order->discount_amount, 2) }}</td></tr>
            @endif
            <tr class="grand-total"><td><strong>Total</strong></td><td style="text-align:right"><strong>£{{ number_format((float)$order->total, 2) }}</strong></td></tr>
        </table>

        @if($order->status === 'preorder')
        <p style="margin-top:20px;padding:12px;background:#fef3c7;border-radius:6px;font-size:13px;">
            ⏳ <strong>Preorder notice:</strong> One or more items in your order are available for preorder.
            We'll contact you once your items are ready.
        </p>
        @endif

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
