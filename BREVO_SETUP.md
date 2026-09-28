# Brevo Email Setup Guide

This guide walks you through configuring Brevo (formerly Sendinblue) for transactional emails in the Party Eden POS system.

## 1. Create a Brevo Account

1. Sign up at [brevo.com](https://www.brevo.com/)
2. Verify your email address
3. Complete your account profile

## 2. Get Your SMTP Credentials

1. Log into your Brevo dashboard
2. Navigate to **SMTP & API** → **SMTP**
3. Copy your **SMTP key** (this is your password)
4. Note your SMTP server details:
   - **Host**: `smtp-relay.brevo.com`
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Username**: Your Brevo account email (e.g., `your@email.com`)
   - **Password**: Your SMTP key from step 3

## 3. Configure Sender Domain (Recommended)

For better deliverability, verify your sending domain:

1. In Brevo dashboard, go to **Senders & Domains** → **Domains**
2. Click **Add a domain**
3. Enter your domain (e.g., `partyeden.co.uk`)
4. Add the DNS records Brevo provides:
   - **TXT record** for verification
   - **DKIM** records for email signing
   - **DMARC** record (optional but recommended)
5. Wait for DNS propagation (up to 48 hours)
6. Verify the domain in Brevo

## 4. Configure Laravel Environment

Update your `.env` file with Brevo SMTP settings:

```env
# Mail Configuration
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your-brevo-account@email.com
MAIL_PASSWORD=your-smtp-key-here

# Sender Information
MAIL_FROM_ADDRESS=orders@partyeden.co.uk
MAIL_FROM_NAME="Party Eden"

# Admin Notifications
MAIL_ADMIN_EMAIL=admin@partyeden.co.uk
```

### Alternative: SSL on Port 465

If you prefer SSL instead of TLS:

```env
MAIL_SCHEME=ssl
MAIL_PORT=465
```

## 5. Test Your Configuration

### Quick Test via Artisan

```bash
php artisan tinker
```

```php
Mail::raw('Test email from Party Eden POS', function ($message) {
    $message->to('your@email.com')->subject('Brevo Test');
});
```

### Test Order Confirmation Flow

1. Place a test order on the storefront
2. Check the customer email receives "Order Confirmation"
3. Check the admin email receives "New Order Received"

### Check Logs

If emails fail, check:
```bash
tail -f storage/logs/laravel.log
```

## 6. Scheduled Email Commands

The following commands are automatically scheduled in `routes/console.php`:

| Command | Schedule | Description |
|---------|----------|-------------|
| `orders:send-daily-report` | Daily 08:00 | Admin digest of pending orders |
| `orders:send-pending-reminders` | Daily 10:00 | Customer reminders for orders pending >24h |
| `orders:send-feedback-requests` | Daily 14:00 | Feedback requests for delivered orders (2-3 days old) |

### Ensure Cron is Running

Add this to your server's crontab (`crontab -e`):

```cron
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### Run Commands Manually (Testing)

```bash
# Send daily orders report now
php artisan orders:send-daily-report

# Send pending order reminders now
php artisan orders:send-pending-reminders

# Send feedback requests now
php artisan orders:send-feedback-requests
```

## 7. Email Templates

All email templates are located in `resources/views/emails/`:

```
emails/
├── orders/
│   ├── confirmation.blade.php      # Order placed (customer)
│   ├── admin-new-order.blade.php   # Order placed (admin)
│   ├── status-update.blade.php     # Generic status change
│   ├── delivered.blade.php         # Order delivered ✨ NEW
│   ├── pending-reminder.blade.php  # 24h pending reminder ✨ NEW
│   └── feedback-request.blade.php  # Post-delivery feedback ✨ NEW
└── admin/
    └── daily-orders-report.blade.php # Daily digest ✨ NEW
```

### Customize Templates

Edit any `.blade.php` file to match your brand:
- Colors: Update the `<style>` section
- Logo: Add `<img src="...">` in the header
- Content: Modify the HTML body

## 8. Email Events Summary

| Event | Trigger | Recipient | Template |
|-------|---------|-----------|----------|
| **Order Placed** | Checkout success | Customer | `confirmation.blade.php` |
| **Order Placed** | Checkout success | Admin | `admin-new-order.blade.php` |
| **Status Changed** | Admin updates status | Customer | `status-update.blade.php` |
| **Order Delivered** | Status → `delivered` | Customer | `delivered.blade.php` |
| **Pending >24h** | Scheduled daily | Customer | `pending-reminder.blade.php` |
| **Feedback Request** | Delivered 2-3 days ago | Customer | `feedback-request.blade.php` |
| **Daily Report** | Scheduled 08:00 | Admin | `daily-orders-report.blade.php` |

## 9. Brevo Dashboard Monitoring

Monitor your email performance in Brevo:

1. **Logs** → See all sent emails, opens, clicks
2. **Statistics** → Delivery rates, bounce rates
3. **Templates** → Manage email templates (if using Brevo's template editor)

## 10. Troubleshooting

### Emails Not Sending

1. **Check credentials**: Verify `MAIL_USERNAME` and `MAIL_PASSWORD` in `.env`
2. **Check logs**: `tail -f storage/logs/laravel.log`
3. **Test SMTP connection**:
   ```bash
   telnet smtp-relay.brevo.com 587
   ```
4. **Clear config cache**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### Emails Going to Spam

1. **Verify sender domain** (see step 3)
2. **Set up DKIM** in Brevo
3. **Use a professional from address** (not @gmail.com)
4. **Check Brevo sender reputation**

### Queue Not Processing

If using queued emails (recommended for production):

```bash
# Start queue worker
php artisan queue:work

# Or use supervisor for production (see Laravel docs)
```

## 11. Production Checklist

- [ ] Brevo account created and verified
- [ ] Sender domain verified with DNS records
- [ ] `.env` configured with Brevo SMTP credentials
- [ ] `MAIL_ADMIN_EMAIL` set to operations inbox
- [ ] Test order placed and confirmation received
- [ ] Cron job running `schedule:run` every minute
- [ ] Queue worker running (if using queued emails)
- [ ] Brevo dashboard monitored for bounces

## Support

- **Brevo Documentation**: https://developers.brevo.com/
- **Brevo Support**: https://www.brevo.com/support/
- **Laravel Mail Docs**: https://laravel.com/docs/mail
