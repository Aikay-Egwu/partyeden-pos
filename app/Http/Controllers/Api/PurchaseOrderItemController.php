<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\PurchaseOrderItem\StorePurchaseOrderItemRequest;
use App\Http\Requests\PurchaseOrderItem\UpdatePurchaseOrderItemRequest;
use App\Http\Resources\PurchaseOrderItemResource;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PurchaseOrderItemController extends ApiController
{
    public function index(Request $request, PurchaseOrder $purchaseOrder): AnonymousResourceCollection
    {
        $this->authorize('viewAny', PurchaseOrderItem::class);

        $items = $purchaseOrder->items()
            ->with(['product', 'variant'])
            ->get();

        return PurchaseOrderItemResource::collection($items);
    }

    public function store(StorePurchaseOrderItemRequest $request, PurchaseOrder $purchaseOrder): PurchaseOrderItemResource
    {
        $this->authorize('create', PurchaseOrderItem::class);

        $data = $request->validated();
        if (! isset($data['total_cost'])) {
            $data['total_cost'] = $data['quantity'] * $data['unit_cost'];
        }

        $item = $purchaseOrder->items()->create($data);
        $item->load(['product', 'variant']);

        return new PurchaseOrderItemResource($item);
    }

    public function show(PurchaseOrderItem $purchaseOrderItem): PurchaseOrderItemResource
    {
        $this->authorize('view', $purchaseOrderItem);

        $purchaseOrderItem->load(['product', 'variant']);

        return new PurchaseOrderItemResource($purchaseOrderItem);
    }

    public function update(UpdatePurchaseOrderItemRequest $request, PurchaseOrderItem $purchaseOrderItem): PurchaseOrderItemResource
    {
        $this->authorize('update', $purchaseOrderItem);

        $data = $request->validated();
        if (isset($data['quantity']) && isset($data['unit_cost']) && ! isset($data['total_cost'])) {
            $data['total_cost'] = $data['quantity'] * $data['unit_cost'];
        }

        $purchaseOrderItem->update($data);

        return new PurchaseOrderItemResource($purchaseOrderItem->refresh());
    }

    public function destroy(PurchaseOrderItem $purchaseOrderItem): JsonResponse
    {
        $this->authorize('delete', $purchaseOrderItem);

        $purchaseOrderItem->delete();

        return $this->respondDeleted('Purchase order item');
    }

    public function markReceived(Request $request, PurchaseOrderItem $purchaseOrderItem): PurchaseOrderItemResource
    {
        $this->authorize('update', $purchaseOrderItem);

        $request->validate([
            'quantity_received' => ['required', 'numeric', 'min:0', 'max:'.$purchaseOrderItem->quantity],
        ]);

        $purchaseOrderItem->update([
            'quantity_received' => $request->input('quantity_received'),
        ]);

        return new PurchaseOrderItemResource($purchaseOrderItem->refresh());
    }
}
