<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\TransactionResource;
use App\Models\InventoryBalance;
use App\Models\Order;
use App\Models\Product;
use App\Models\TillSession;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class DashboardController extends ApiController
{
    public function __invoke(): JsonResponse
    {
        Gate::authorize('viewAny', Transaction::class);
        $today = now()->toDateString();

        $todaySales = Transaction::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->selectRaw('COUNT(*) as count, SUM(total) as total')
            ->first();

        $activeTills = TillSession::where('status', 'open')
            ->withCount('transactions')
            ->get(['id', 'staff_id', 'location_id', 'opened_at', 'opening_balance', 'cash_sales']);

        $lowStockCount = InventoryBalance::query()
            ->join('products', 'inventory_balances.product_id', '=', 'products.id')
            ->whereColumn('inventory_balances.quantity', '<=', 'products.reorder_level')
            ->where('products.reorder_level', '>', 0)
            ->count();

        $recentTransactions = TransactionResource::collection(
            Transaction::where('status', 'completed')
                ->with(['staff', 'customer', 'location'])
                ->latest()
                ->limit(10)
                ->get()
        );

        $pendingOrders = Order::where('status', 'pending')
            ->count();

        $productCount = Product::count();
        $activeProductCount = Product::where('is_active', true)->count();

        return response()->json([
            'data' => [
                'today' => [
                    'transaction_count' => (int) $todaySales->count,
                    'total_sales' => (float) $todaySales->total,
                ],
                'active_tills' => $activeTills,
                'low_stock_count' => $lowStockCount,
                'recent_transactions' => $recentTransactions,
                'pending_orders' => $pendingOrders,
                'products' => [
                    'total' => $productCount,
                    'active' => $activeProductCount,
                ],
            ],
        ]);
    }
}
