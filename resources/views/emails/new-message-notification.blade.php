<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Contact Message</title>
    <style>
        body { font-family: sans-serif; color: #333; background: #f7f7f7; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #7c3aed; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 24px 32px; }
        .section-title { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px 12px; background: #f3f4f6; color: #374151; width: 140px; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #6b7280; text-align: center; }
        .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
        .cta { display:inline-block; margin-top:16px; padding:10px 24px; background:#7c3aed; color:#fff; text-decoration:none; border-radius:6px; font-weight:600; font-size:14px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>New Contact Message</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px;">From {{ $contactMessage->first_name }} {{ $contactMessage->last_name }}</p>
    </div>

    <div class="content">
        <div class="section-title">Contact Details</div>
        <table>
            <tr>
                <th>Name</th>
                <td>{{ $contactMessage->first_name }} {{ $contactMessage->last_name }}</td>
            </tr>
            <tr>
                <th>Email</th>
                <td><a href="mailto:{{ $contactMessage->email }}">{{ $contactMessage->email }}</a></td>
            </tr>
            @if($contactMessage->phone)
            <tr>
                <th>Phone</th>
                <td><a href="tel:{{ $contactMessage->phone }}">{{ $contactMessage->phone }}</a></td>
            </tr>
            @endif
            <tr>
                <th>Event Type</th>
                <td>{{ $contactMessage->event_type }}</td>
            </tr>
            @if($contactMessage->event_date)
            <tr>
                <th>Event Date</th>
                <td>{{ $contactMessage->event_date->format('d M Y') }}</td>
            </tr>
            @endif
        </table>

        <div class="section-title">Message</div>
        <div class="message-box">{{ $contactMessage->message }}</div>

        <a href="{{ url('/admin/messages/' . $contactMessage->id) }}" class="cta">View &amp; Reply in Admin</a>
    </div>

    <div class="footer">
        Party Eden — Admin Notification
    </div>
</div>
</body>
</html>
