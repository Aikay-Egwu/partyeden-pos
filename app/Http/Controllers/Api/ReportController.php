<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\InventoryBalance;
use App\Models\Product;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReportController extends ApiController
{
    public function salesSummary(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Transaction::class);
        $query = Transaction::where('status', 'completed')
            ->dateRange($request->input('from'), $request->input('to'))
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id));

        $stats = $query->selectRaw('
            COUNT(*) as total_transactions,
            SUM(total) as total_sales,
            SUM(tax_amount) as total_tax,
            SUM(discount_amount) as total_discounts,
            AVG(total) as average_transaction_value
        ')->first();

        return response()->json([
            'data' => [
                'total_transactions' => (int) $stats->total_transactions,
                'total_sales' => (float) $stats->total_sales,
                'total_tax' => (float) $stats->total_tax,
                'total_discounts' => (float) $stats->total_discounts,
                'average_transaction_value' => (float) $stats->average_transaction_value,
            ],
        ]);
    }

    public function inventoryValuation(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', InventoryBalance::class);
        $query = InventoryBalance::query()
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id));

        $total = $query->join('products', 'inventory_balances.product_id', '=', 'products.id')
            ->selectRaw('
                SUM(inventory_balances.quantity) as total_units,
                SUM(inventory_balances.quantity * products.cost_price) as total_value
            ')
            ->first();

        return response()->json([
            'data' => [
                'total_units' => (float) $total->total_units,
                'total_value' => (float) $total->total_value,
            ],
        ]);
    }

    public function lowStockAlert(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Product::class);
        $threshold = (int) $request->input('threshold', 10);
        $locationId = $request->input('location_id');

        $lowStock = InventoryBalance::query()
            ->when($locationId, fn ($q, $id) => $q->where('location_id', $id))
            ->join('products', 'inventory_balances.product_id', '=', 'products.id')
            ->whereColumn('inventory_balances.quantity', '<=', 'products.reorder_level')
            ->where('products.reorder_level', '>', 0)
            ->select([
                'inventory_balances.id',
                'inventory_balances.product_id',
                'inventory_balances.variant_id',
                'inventory_balances.location_id',
                'inventory_balances.quantity',
                'products.name as product_name',
                'products.sku',
                'products.reorder_level',
            ])
            ->limit($threshold)
            ->get();

        return response()->json(['data' => $lowStock]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Transaction::class);
        $limit = (int) $request->input('limit', 10);

        $topProducts = Transaction::where('status', 'completed')
            ->dateRange($request->input('from'), $request->input('to'))
            ->join('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->selectRaw('
                transaction_items.product_id,
                transaction_items.product_name,
                SUM(transaction_items.quantity) as total_quantity,
                SUM(transaction_items.total) as total_revenue,
                COUNT(DISTINCT transactions.id) as transaction_count
            ')
            ->groupBy(['transaction_items.product_id', 'transaction_items.product_name'])
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $topProducts]);
    }

    public function staffPerformance(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Staff::class);
        $from = $request->input('from');
        $to = $request->input('to');

        $performance = Staff::query()
            ->where('is_active', true)
            ->withCount(['transactions as completed_transactions' => function ($q) use ($from, $to) {
                $q->where('status', 'completed')
                    ->dateRange($from, $to);
            }])
            ->withSum(['transactions as total_sales' => function ($q) use ($from, $to) {
                $q->where('status', 'completed')
                    ->dateRange($from, $to);
            }], 'total')
            ->orderByDesc('total_sales')
            ->get(['id', 'first_name', 'last_name', 'role']);

        return response()->json(['data' => $performance]);
    }
}
