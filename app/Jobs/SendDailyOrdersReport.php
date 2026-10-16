<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\DailyOrdersReportMail;
use App\Models\Order;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

/**
 * Queued job that sends the daily orders digest to the admin.
 *
 * Orders are split into "today" and "future" buckets using the
 * customer-requested date (expected_at), falling back to the placed or
 * created date when no requested date was captured. Cancelled and already
 * delivered orders are excluded since they need no fulfillment action.
 */
class SendDailyOrdersReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = today();

        $orders = $this->activeOrdersFrom($today)
            ->sortBy(fn (Order $order) => $this->effectiveDate($order))
            ->values();

        $todaysOrders = $orders->filter(fn (Order $order) => $this->effectiveDate($order)->isSameDay($today))->values();
        $futureOrders = $orders->filter(fn (Order $order) => $this->effectiveDate($order)->gt($today))->values();

        if ($todaysOrders->isEmpty() && $futureOrders->isEmpty()) {
            return; // Nothing scheduled today or later — skip the email.
        }

        $admin = User::whereJsonContains('permissions', 'admin')
            ->orWhereJsonContains('permissions', '*')->get();
        foreach ($admin as $admin) {
            Mail::to($admin)->send(new DailyOrdersReportMail($todaysOrders, $futureOrders));
        }
        /* if ($adminEmail) {
            Mail::to($adminEmail)->send(new DailyOrdersReportMail($todaysOrders, $futureOrders));
        } */
    }

    /**
     * Non-cancelled/delivered orders whose effective date is today or later.
     *
     * The date is resolved at the DB level (expected_at, else placed_at, else
     * created_at) so the result set stays bounded as order history grows.
     *
     * @return Collection<int, Order>
     */
    private function activeOrdersFrom(CarbonInterface $today): Collection
    {
        return Order::with(['customer', 'items.product'])
            ->whereNotIn('status', ['cancelled', 'delivered'])
            ->where(function ($query) use ($today) {
                $query->whereDate('expected_at', '>=', $today)
                    ->orWhere(fn ($q) => $q->whereNull('expected_at')->whereDate('placed_at', '>=', $today))
                    ->orWhere(fn ($q) => $q->whereNull('expected_at')->whereNull('placed_at')->whereDate('created_at', '>=', $today));
            })
            ->get();
    }

    private function effectiveDate(Order $order): CarbonInterface
    {
        return ($order->expected_at ?? $order->placed_at ?? $order->created_at)->copy()->startOfDay();
    }
}
