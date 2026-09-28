<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily admin report of pending orders (runs at 8:00 AM)
Schedule::command('orders:send-daily-report')
    ->dailyAt('08:00')
    ->description('Send daily pending orders report to admin');

// Customer reminders for orders pending > 24 hours (runs at 10:00 AM)
Schedule::command('orders:send-pending-reminders')
    ->dailyAt('10:00')
    ->description('Send reminders to customers with pending orders > 24h');

// Feedback requests for delivered orders 2-3 days old (runs at 2:00 PM)
Schedule::command('orders:send-feedback-requests')
    ->dailyAt('14:00')
    ->description('Send feedback requests for recently delivered orders');
