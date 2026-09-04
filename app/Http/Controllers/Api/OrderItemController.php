<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\OrderItem\StoreOrderItemRequest;
use App\Http\Requests\OrderItem\UpdateOrderItemRequest;
use App\Http\Resources\OrderItemResource;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemController extends ApiController
{
    public function index(Order $order): JsonResource
    {
        $this->authorize('view', $order);

        $items = $order->items()
            ->with(['product', 'variant'])
            ->get();

        return OrderItemResource::collection($items);
    }

    public function store(StoreOrderItemRequest $request, Order $order): OrderItemResource
    {
        $this->authorize('update', $order);

        $item = $order->items()->create($request->validated());

        return new OrderItemResource($item->load(['product', 'variant']));
    }

    public function show(OrderItem $orderItem): OrderItemResource
    {
        $this->authorize('view', $orderItem->order);

        $orderItem->load(['product', 'variant']);

        return new OrderItemResource($orderItem);
    }

    public function update(UpdateOrderItemRequest $request, OrderItem $orderItem): OrderItemResource
    {
        $this->authorize('update', $orderItem->order);

        $orderItem->update($request->validated());

        return new OrderItemResource($orderItem->load(['product', 'variant']));
    }

    public function destroy(OrderItem $orderItem): JsonResponse
    {
        $this->authorize('update', $orderItem->order);

        $orderItem->delete();

        return $this->respondDeleted('Order item');
    }

    public function fulfill(OrderItem $orderItem): OrderItemResource
    {
        $this->authorize('update', $orderItem->order);

        $orderItem->update(['status' => 'fulfilled']);

        return new OrderItemResource($orderItem->load(['product', 'variant']));
    }
}
