<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Order Received</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #7c3aed; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 12px; background: #f3f4f6; color: #374151; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .cta { display:inline-block; margin-top:16px; padding:10px 24px; background:#7c3aed; color:#fff; text-decoration:none; border-radius:6px; font-weight:600; font-size:14px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🛒 New Order Received</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">{{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>A new order has been placed and is waiting for confirmation.</p>

        {{-- Customer info --}}
        <div class="section-title">Customer</div>
        <p style="font-size:14px;margin:0;">
            @if($order->customer)
                {{ $order->customer->first_name }} {{ $order->customer->last_name }}
                @if($order->customer->email)
                    &lt;{{ $order->customer->email }}&gt;
                @endif
            @else
                Guest checkout
            @endif
        </p>

        {{-- Fulfillment --}}
        <div class="section-title">Fulfillment</div>
        <p style="font-size:14px;margin:0;">
            @if($order->fulfillment_type === 'delivery')
                🚚 Delivery
                @if($order->delivery_postcode) — postcode {{ $order->delivery_postcode }}@endif
                @if($order->deliveryZone) ({{ $order->deliveryZone->name }})@endif
            @else
                🏪 Pickup / Collection
            @endif
        </p>

        {{-- Items --}}
        <div class="section-title">Items ({{ $order->items->count() }})</div>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align:right">Qty</th>
                    <th style="text-align:right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items->whereNull('parent_order_item_id') as $item)
                <tr>
                    <td>
                        {{ $item->product?->name ?? 'Item' }}
                        @if($item->customization_text)
                            <br><small style="color:#6b7280;">✏️ "{{ $item->customization_text }}"</small>
                        @endif
                    </td>
                    <td style="text-align:right">{{ (float)$item->quantity }}</td>
                    <td style="text-align:right">£{{ number_format((float)$item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <p style="margin-top:12px;font-size:15px;font-weight:700;">
            Total: £{{ number_format((float)$order->total, 2) }}
            @if($order->status === 'preorder')
                &nbsp;<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">PREORDER</span>
            @endif
        </p>

        <a href="{{ url('/admin/orders/' . $order->id) }}" class="cta">View Order in Admin</a>

        @if($order->notes)
        <p style="margin-top:20px;font-size:13px;color:#6b7280;"><strong>Customer notes:</strong> {{ $order->notes }}</p>
        @endif
    </div>

    <div class="footer">
        Party Eden EPOS — Internal notification
    </div>
</div>
</body>
</html>
