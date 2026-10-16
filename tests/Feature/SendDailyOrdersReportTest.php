<?php

declare(strict_types=1);

use App\Jobs\SendDailyOrdersReport;
use App\Mail\DailyOrdersReportMail;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

// The digest is delivered to admin users (identified via the JSON
// `permissions` column), so every scenario needs at least one admin present.
beforeEach(function (): User {
    return User::factory()->create([
        'email' => 'admin@example.com',
        'permissions' => ['admin'],
    ]);
});

it('splits orders into today and upcoming buckets and skips past/cancelled/delivered', function (): void {
    Mail::fake();

    $customer = Customer::factory()->create();

    $today = Order::factory()->for($customer)->create(['expected_at' => now()->setTime(12, 0)]);
    $future = Order::factory()->for($customer)->create(['expected_at' => now()->addDays(3)]);

    // These must be excluded from the digest.
    Order::factory()->for($customer)->create(['expected_at' => now()->subDays(2)]);
    Order::factory()->for($customer)->create(['expected_at' => now()->addDay(), 'status' => 'cancelled']);
    Order::factory()->for($customer)->create(['expected_at' => now()->addDay(), 'status' => 'delivered']);

    (new SendDailyOrdersReport)->handle();

    Mail::assertSent(DailyOrdersReportMail::class, function (DailyOrdersReportMail $mail) use ($today, $future): bool {
        $html = $mail->render();

        return $mail->hasTo('admin@example.com')
            && $mail->todaysOrders->pluck('id')->all() === [$today->id]
            && $mail->futureOrders->pluck('id')->all() === [$future->id]
            && str_contains($html, 'Due Today')
            && str_contains($html, 'Upcoming Orders')
            && str_contains($html, $today->order_number)
            && str_contains($html, $future->order_number);
    });
});

it('falls back to the placed date when no requested date is set', function (): void {
    Mail::fake();

    $customer = Customer::factory()->create();
    $today = Order::factory()->for($customer)->create(['expected_at' => null, 'placed_at' => now()]);
    Order::factory()->for($customer)->create(['expected_at' => null, 'placed_at' => now()->subWeek()]);

    (new SendDailyOrdersReport)->handle();

    Mail::assertSent(DailyOrdersReportMail::class, fn (DailyOrdersReportMail $mail): bool => $mail->todaysOrders->pluck('id')->all() === [$today->id]
        && $mail->futureOrders->isEmpty()
    );
});

it('sends nothing when there are no orders today or in the future', function (): void {
    Mail::fake();

    $customer = Customer::factory()->create();
    Order::factory()->for($customer)->create(['expected_at' => now()->subDays(5)]);

    (new SendDailyOrdersReport)->handle();

    Mail::assertNothingSent();
});
