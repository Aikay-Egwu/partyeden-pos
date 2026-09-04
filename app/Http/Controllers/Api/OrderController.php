<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class OrderController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::query()
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('payment_status'), fn ($q, $s) => $q->where('payment_status', $s))
            ->when($request->input('customer_id'), fn ($q, $id) => $q->where('customer_id', $id))
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id))
            ->dateRange($request->input('from'), $request->input('to'))
            ->when($request->input('search'), fn ($q, $s) => $q->where('order_number', 'like', "%{$s}%"))
            ->with(['customer', 'location', 'createdBy'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): OrderResource
    {
        $this->authorize('create', Order::class);

        $order = Order::create(array_merge(
            $request->validated(),
            [
                'order_number' => 'ORD-'.strtoupper(Str::random(12)).'-'.now()->format('Ymd'),
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'created_by' => auth()->id(),
            ]
        ));

        return new OrderResource($order->load(['customer', 'location', 'createdBy']));
    }

    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        $order->load([
            'customer', 'location', 'createdBy',
            'items.product', 'items.variant',
            'shipments', 'stockReservations',
        ]);

        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, Order $order): OrderResource
    {
        $this->authorize('update', $order);

        $order->update($request->validated());

        return new OrderResource($order->load(['customer', 'location', 'createdBy']));
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->authorize('delete', $order);

        $order->delete();

        return $this->respondDeleted('Order');
    }

    public function confirm(Order $order): OrderResource
    {
        $this->authorize('update', $order);

        $order->update([
            'status' => 'confirmed',
            'placed_at' => $order->placed_at ?? now(),
        ]);

        return new OrderResource($order->load(['customer', 'location', 'createdBy']));
    }

    public function cancel(Order $order): OrderResource
    {
        $this->authorize('update', $order);

        $order->update(['status' => 'cancelled']);

        return new OrderResource($order->load(['customer', 'location', 'createdBy']));
    }

    public function markPaid(Order $order): OrderResource
    {
        $this->authorize('update', $order);

        $order->update(['payment_status' => 'paid']);

        return new OrderResource($order->load(['customer', 'location', 'createdBy']));
    }
}
