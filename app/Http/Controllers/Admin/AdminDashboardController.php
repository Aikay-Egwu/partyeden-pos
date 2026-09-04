<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();

        // 1. Orders today
        $todayOrdersCount = Order::whereDate('created_at', $today)->count();

        // 2. Revenue today (paid transactions or confirmed orders)
        // Let's sum the total of orders created today that are paid or confirmed.
        $todayRevenue = Order::whereDate('created_at', $today)
            ->whereIn('payment_status', ['paid'])
            ->sum('total');

        // 3. Orders by status
        $ordersByStatus = [
            'pending' => Order::where('status', 'pending')->count(),
            'preorder' => Order::where('status', 'preorder')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'dispatched' => Order::where('status', 'dispatched')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
        ];

        // 4. Low stock count
        // For simplicity, we get products that track inventory and their total inventory balance across all locations is <= reorder_level.
        // Doing this perfectly requires joining inventory_balances, but we can do a simplified check or load them.
        // Since we want just a count, doing a subquery or raw sum is best.
        $lowStockCount = Product::where('track_inventory', true)
            ->whereNotNull('reorder_level')
            ->whereHas('inventoryBalances')
            // Use a raw WHERE with a scalar subquery instead of HAVING, since
            // SQLite rejects HAVING on a non-aggregate query. The subquery
            // computes total stock and compares it directly to reorder_level.
            ->whereRaw(
                '(SELECT SUM("inventory_balances"."quantity") FROM "inventory_balances" WHERE "inventory_balances"."product_id" = "products"."id" AND "inventory_balances"."deleted_at" IS NULL) <= "products"."reorder_level"'
            )
            ->count();

        // 5. Recent 5 orders
        $recentOrders = Order::with('customer')
            ->latest()
            ->take(5)
            ->get(['id', 'order_number', 'status', 'total', 'created_at', 'customer_id']);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'today_orders_count' => $todayOrdersCount,
                'today_revenue' => (float) $todayRevenue,
                'orders_by_status' => $ordersByStatus,
                'low_stock_count' => $lowStockCount,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
