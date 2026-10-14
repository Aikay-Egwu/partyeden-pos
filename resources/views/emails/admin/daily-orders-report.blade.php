<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Daily Orders Report</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 800px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #1e40af; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 12px; }
        .section-count { color: #1e40af; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 10px 12px; background: #f3f4f6; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:hover { background: #f9fafb; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #e5e7eb; color: #374151; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-preorder { background: #dbeafe; color: #1e40af; }
        .badge-confirmed { background: #dcfce7; color: #166534; }
        .badge-processing { background: #ede9fe; color: #5b21b6; }
        .summary-box { background: #eff6ff; border-left: 4px solid #1e40af; padding: 16px; margin: 16px 0; border-radius: 4px; }
        .summary-stat { display: inline-block; margin-right: 32px; }
        .stat-value { font-size: 24px; font-weight: 700; color: #1e40af; }
        .stat-label { font-size: 12px; color: #6b7280; }
        .empty { text-align: center; color: #6b7280; padding: 24px 0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>📊 Daily Orders Report</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">{{ now()->format('l, d F Y') }}</p>
    </div>

    <div class="content">
        @php
            $allOrders = $todaysOrders->concat($futureOrders);
            $sections = [
                ['label' => "Today's Orders", 'orders' => $todaysOrders, 'empty' => '🎉 No orders scheduled for today.'],
                ['label' => 'Upcoming Orders', 'orders' => $futureOrders, 'empty' => 'No future orders scheduled yet.'],
            ];
        @endphp

        <div class="summary-box">
            <div class="summary-stat">
                <div class="stat-value">{{ $todaysOrders->count() }}</div>
                <div class="stat-label">Due Today</div>
            </div>
            <div class="summary-stat">
                <div class="stat-value">{{ $futureOrders->count() }}</div>
                <div class="stat-label">Upcoming</div>
            </div>
            <div class="summary-stat">
                <div class="stat-value">£{{ number_format($allOrders->sum(fn($o) => (float)$o->total), 2) }}</div>
                <div class="stat-label">Total Value</div>
            </div>
        </div>

        @foreach($sections as $section)
            <div class="section-title">
                {{ $section['label'] }} <span class="section-count">({{ $section['orders']->count() }})</span>
            </div>

            @if($section['orders']->isEmpty())
                <p class="empty">{{ $section['empty'] }}</p>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Scheduled</th>
                            <th style="text-align:center">Items</th>
                            <th style="text-align:right">Total</th>
                            <th>Fulfillment</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($section['orders'] as $order)
                        <tr>
                            <td style="font-weight:600;">{{ $order->order_number }}</td>
                            <td>
                                {{ $order->customer?->first_name }} {{ $order->customer?->last_name }}<br>
                                <span style="color:#6b7280;font-size:11px;">{{ $order->customer?->email }}</span>
                            </td>
                            <td>
                                <span class="badge badge-{{ $order->status }}">
                                    {{ ucfirst($order->status) }}
                                </span>
                            </td>
                            <td style="font-size:12px;">
                                @if($order->expected_at)
                                    {{ $order->expected_at->format('d M, H:i') }}
                                @else
                                    {{ ($order->placed_at ?? $order->created_at)?->format('d M Y') }}
                                    <br><span style="color:#6b7280;">(no requested date)</span>
                                @endif
                            </td>
                            <td style="text-align:center;">{{ $order->items->count() }}</td>
                            <td style="text-align:right;font-weight:600;">£{{ number_format((float)$order->total, 2) }}</td>
                            <td style="font-size:12px;">
                                @if($order->fulfillment_type === 'delivery')
                                    🚚 Delivery
                                    @if($order->delivery_postcode)
                                        <br><span style="color:#6b7280;">{{ $order->delivery_postcode }}</span>
                                    @endif
                                @else
                                    🏪 Pickup
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        @endforeach

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="font-size:13px;color:#6b7280;margin:0;">
                <strong>⚡ Action Required:</strong> Review and confirm these orders in the admin dashboard to begin fulfillment.
            </p>
        </div>
    </div>

    <div class="footer">
        Party Eden Admin — Daily Operations Report<br>
        Generated at {{ now()->format('d M Y, H:i') }}
    </div>
</div>
</body>
</html>
