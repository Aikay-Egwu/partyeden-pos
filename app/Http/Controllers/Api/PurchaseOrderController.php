<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\UpdatePurchaseOrderRequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        $orders = PurchaseOrder::query()
            ->when($request->search, fn ($q, $s) => $q->where('po_number', 'like', "%{$s}%"))
            ->when($request->supplier_id, fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['supplier', 'location'])
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return PurchaseOrderResource::collection($orders);
    }

    public function store(StorePurchaseOrderRequest $request): PurchaseOrderResource
    {
        $this->authorize('create', PurchaseOrder::class);

        $data = array_merge($request->validated(), [
            'created_by' => auth()->id(),
        ]);

        $purchaseOrder = PurchaseOrder::create($data);

        return new PurchaseOrderResource($purchaseOrder->load(['supplier', 'location']));
    }

    public function show(PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        $this->authorize('view', $purchaseOrder);

        $purchaseOrder->load(['supplier', 'location', 'createdBy', 'items.product', 'items.variant']);

        return new PurchaseOrderResource($purchaseOrder);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        $this->authorize('update', $purchaseOrder);

        $purchaseOrder->update($request->validated());

        return new PurchaseOrderResource($purchaseOrder->refresh()->load(['supplier', 'location']));
    }

    public function destroy(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $this->authorize('delete', $purchaseOrder);

        $purchaseOrder->delete();

        return $this->respondDeleted('Purchase order');
    }

    public function duplicate(PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        $this->authorize('create', PurchaseOrder::class);

        $newOrder = $purchaseOrder->replicate(['po_number']);
        $newOrder->po_number = $purchaseOrder->po_number.'-copy-'.now()->format('Ymd');
        $newOrder->status = 'draft';
        $newOrder->received_date = null;
        $newOrder->save();

        // Duplicate items
        foreach ($purchaseOrder->items as $item) {
            $newOrder->items()->create($item->only([
                'product_id', 'variant_id', 'quantity', 'quantity_received', 'unit_cost', 'total_cost',
            ]));
        }

        return new PurchaseOrderResource($newOrder->load(['supplier', 'location', 'items']));
    }
}
