<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\LoyaltyAccount;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    /**
     * Customer portal home — overview card + recent orders + quick links.
     */
    public function index(Request $request): Response
    {
        /** @var Customer $customer */
        $customer = Auth::user();

        // Identity shape returned to frontend (no internal IDs, no password/remember_token)
        $customerProps = [
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ];

        // Loyalty points: if a loyalty account exists, return its balance, else 0.
        $loyaltyPoints = 0;
        if ($customer->relationLoaded('loyaltyAccount') === false) {
            $customer->loadMissing('loyaltyAccount');
        }
        $loyaltyAccount = $customer->loyaltyAccount;
        if ($loyaltyAccount instanceof LoyaltyAccount) {
            $loyaltyPoints = (int) ($loyaltyAccount->points_balance ?? 0);
        }

        // Most recent 5 orders (created desc) — any status. Return a simple array shape
        // that TSX can consume directly without Orchid-style model proxies.
        $orders = Order::query()
            ->where('customer_id', $customer->getKey())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Order $o): array => [
                'id' => $o->getKey(),
                'total' => (string) data_get($o, 'total', ''),
                'status' => (string) data_get($o, 'status', ''),
                'created_at' => $o->created_at?->toIso8601String(),
            ])
            ->all();

        // Quick links. Only routes that exist are wired with route(); others use '#'.
        $quickLinks = [
            ['label' => 'Orders',    'href' => '#',                            'icon' => 'Package'],
            ['label' => 'Profile',   'href' => '#',                            'icon' => 'User'],
            ['label' => 'Addresses', 'href' => '#',                            'icon' => 'MapPin'],
            ['label' => 'Loyalty',   'href' => '#',                            'icon' => 'Gift'],
        ];

        return Inertia::render('customer/home', [
            'customer' => $customerProps,
            'orders' => $orders,
            'loyaltyPoints' => $loyaltyPoints,
            'quickLinks' => $quickLinks,
        ]);
    }
}
