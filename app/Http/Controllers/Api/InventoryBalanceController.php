<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\InventoryBalanceResource;
use App\Models\InventoryBalance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryBalanceController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', InventoryBalance::class);

        $balances = InventoryBalance::query()
            ->when($request->location_id, fn ($q, $id) => $q->where('location_id', $id))
            ->when($request->product_id, fn ($q, $id) => $q->where('product_id', $id))
            ->when($request->variant_id, fn ($q, $id) => $q->where('variant_id', $id))
            ->with(['product', 'variant', 'location'])
            ->paginate($request->integer('per_page', 25));

        return InventoryBalanceResource::collection($balances);
    }

    public function show(InventoryBalance $inventoryBalance): InventoryBalanceResource
    {
        $this->authorize('view', $inventoryBalance);

        $inventoryBalance->load(['product', 'variant', 'location']);

        return new InventoryBalanceResource($inventoryBalance);
    }

    public function adjust(Request $request, InventoryBalance $inventoryBalance): InventoryBalanceResource
    {
        $this->authorize('update', $inventoryBalance);

        $request->validate([
            'quantity' => ['required', 'numeric'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $adjustment = (float) $request->input('quantity');
        $inventoryBalance->update([
            'quantity' => $inventoryBalance->quantity + $adjustment,
        ]);

        // Log the movement
        $inventoryBalance->location->inventoryMovements()->create([
            'product_id' => $inventoryBalance->product_id,
            'variant_id' => $inventoryBalance->variant_id,
            'type' => 'adjustment',
            'quantity' => $adjustment,
            'reason' => $request->input('reason', 'Manual adjustment'),
            'user_id' => auth()->id(),
        ]);

        return new InventoryBalanceResource($inventoryBalance->refresh()->load(['product', 'variant', 'location']));
    }
}
