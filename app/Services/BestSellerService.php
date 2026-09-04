<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BestSellerService
{
    /**
     * Resolve homepage best sellers using admin-ranked products first,
     * then backfill with products ranked by sold quantity.
     */
    public function topProducts(int $limit = 10): EloquentCollection
    {
        $manualIds = Product::query()
            ->onlineVisible()
            ->where('is_active', true)
            ->where('best_seller_enabled', true)
            ->orderByRaw('CASE WHEN best_seller_rank IS NULL THEN 1 ELSE 0 END')
            ->orderBy('best_seller_rank')
            ->limit($limit)
            ->pluck('id');

        $remaining = max(0, $limit - $manualIds->count());

        $automaticIds = $remaining > 0
            ? $this->topSellingProductIds($remaining, $manualIds)
            : collect();

        $orderedIds = $manualIds
            ->concat($automaticIds)
            ->unique()
            ->values();

        if ($orderedIds->count() < $limit) {
            $fallbackIds = Product::query()
                ->onlineVisible()
                ->where('is_active', true)
                ->whereNotIn('id', $orderedIds)
                ->latest()
                ->limit($limit - $orderedIds->count())
                ->pluck('id');

            $orderedIds = $orderedIds->concat($fallbackIds)->values();
        }

        if ($orderedIds->isEmpty()) {
            return new EloquentCollection;
        }

        $products = Product::query()
            ->with([
                'category',
                'images' => fn ($query) => $query
                    ->whereNull('variant_id')
                    ->whereNull('primary_color_id')
                    ->whereNull('addon_product_id')
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order'),
            ])
            ->whereIn('id', $orderedIds)
            ->get()
            ->keyBy('id');

        return new EloquentCollection(
            $orderedIds
                ->map(fn (string $id) => $products->get($id))
                ->filter()
                ->all(),
        );
    }

    private function topSellingProductIds(int $limit, Collection $excludeIds): Collection
    {
        return OrderItem::query()
            ->select('product_id')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNotNull('product_id')
            ->whereNull('order_items.deleted_at')
            ->whereNull('orders.deleted_at')
            ->whereIn('orders.status', ['confirmed', 'preparing', 'ready', 'dispatched', 'delivered'])
            ->whereNotIn('product_id', $excludeIds)
            ->groupBy('product_id')
            ->orderByDesc(DB::raw('SUM(quantity)'))
            ->limit($limit)
            ->pluck('product_id');
    }
}
