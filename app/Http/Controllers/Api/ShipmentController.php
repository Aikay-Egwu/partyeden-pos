<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Shipment\StoreShipmentRequest;
use App\Http\Requests\Shipment\UpdateShipmentRequest;
use App\Http\Resources\ShipmentResource;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipmentController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Shipment::class);

        $shipments = Shipment::query()
            ->when($request->input('order_id'), fn ($q, $id) => $q->where('order_id', $id))
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('carrier'), fn ($q, $c) => $q->where('carrier', $c))
            ->with('order')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ShipmentResource::collection($shipments);
    }

    public function store(StoreShipmentRequest $request): ShipmentResource
    {
        $this->authorize('create', Shipment::class);

        $shipment = Shipment::create(array_merge(
            $request->validated(),
            ['status' => 'pending']
        ));

        return new ShipmentResource($shipment->load('order'));
    }

    public function show(Shipment $shipment): ShipmentResource
    {
        $this->authorize('view', $shipment);

        $shipment->load('order');

        return new ShipmentResource($shipment);
    }

    public function update(UpdateShipmentRequest $request, Shipment $shipment): ShipmentResource
    {
        $this->authorize('update', $shipment);

        $shipment->update($request->validated());

        return new ShipmentResource($shipment->load('order'));
    }

    public function destroy(Shipment $shipment): JsonResponse
    {
        $this->authorize('delete', $shipment);

        $shipment->delete();

        return $this->respondDeleted('Shipment');
    }

    public function markShipped(Shipment $shipment): ShipmentResource
    {
        $this->authorize('update', $shipment);

        $shipment->update([
            'status' => 'shipped',
            'shipped_at' => now(),
        ]);

        $shipment->order->update(['status' => 'shipped']);

        return new ShipmentResource($shipment->load('order'));
    }

    public function markDelivered(Shipment $shipment): ShipmentResource
    {
        $this->authorize('update', $shipment);

        $shipment->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        return new ShipmentResource($shipment->load('order'));
    }

    public function track(Shipment $shipment): ShipmentResource
    {
        $this->authorize('view', $shipment);

        $shipment->load('order');

        return new ShipmentResource($shipment);
    }
}
