<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\PriceHistory\StorePriceHistoryRequest;
use App\Http\Resources\PriceHistoryResource;
use App\Models\PriceHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriceHistoryController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $histories = PriceHistory::query()
            ->when($request->product_id, fn ($q, $id) => $q->where('product_id', $id))
            ->when($request->variant_id, fn ($q, $id) => $q->where('variant_id', $id))
            ->with(['product', 'variant', 'changedBy'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return PriceHistoryResource::collection($histories);
    }

    public function store(StorePriceHistoryRequest $request): PriceHistoryResource
    {
        $product = Product::findOrFail($request->input('product_id'));
        $variantId = $request->input('variant_id');

        $oldPrice = $variantId
            ? $product->variants()->where('id', $variantId)->first()?->price_adjustment ?? 0
            : $product->selling_price;

        $history = PriceHistory::create([
            'product_id' => $request->input('product_id'),
            'variant_id' => $variantId,
            'old_price' => $oldPrice,
            'new_price' => $request->input('new_price'),
            'changed_by' => $request->user()->id,
            'reason' => $request->input('reason'),
        ]);

        if ($variantId) {
            $product->variants()->where('id', $variantId)->update([
                'price_adjustment' => $request->input('new_price'),
            ]);
        } else {
            $product->update(['selling_price' => $request->input('new_price')]);
        }

        return new PriceHistoryResource($history->load(['product', 'changedBy']));
    }
}
