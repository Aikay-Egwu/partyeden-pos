<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\StockReservation\StoreStockReservationRequest;
use App\Http\Resources\StockReservationResource;
use App\Models\StockReservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockReservationController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', StockReservation::class);

        $reservations = StockReservation::query()
            ->when($request->product_id, fn ($q, $id) => $q->where('product_id', $id))
            ->when($request->location_id, fn ($q, $id) => $q->where('location_id', $id))
            ->when($request->order_id, fn ($q, $id) => $q->where('order_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['product', 'variant', 'location'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return StockReservationResource::collection($reservations);
    }

    public function store(StoreStockReservationRequest $request): StockReservationResource
    {
        $this->authorize('create', StockReservation::class);

        $reservation = StockReservation::create($request->validated());
        $reservation->load(['product', 'variant', 'location']);

        return new StockReservationResource($reservation);
    }

    public function show(StockReservation $stockReservation): StockReservationResource
    {
        $this->authorize('view', $stockReservation);

        $stockReservation->load(['product', 'variant', 'location', 'order']);

        return new StockReservationResource($stockReservation);
    }

    public function destroy(StockReservation $stockReservation): JsonResponse
    {
        $this->authorize('delete', $stockReservation);

        $stockReservation->update(['status' => 'cancelled']);

        return $this->respondDeleted('Stock reservation');
    }

    public function release(StockReservation $stockReservation): StockReservationResource
    {
        $this->authorize('update', $stockReservation);

        $stockReservation->update(['status' => 'cancelled']);

        return new StockReservationResource($stockReservation->refresh());
    }

    public function extend(Request $request, StockReservation $stockReservation): StockReservationResource
    {
        $this->authorize('update', $stockReservation);

        $request->validate([
            'expires_at' => ['required', 'date', 'after:now'],
        ]);

        $stockReservation->update([
            'expires_at' => $request->input('expires_at'),
        ]);

        return new StockReservationResource($stockReservation->refresh());
    }
}
