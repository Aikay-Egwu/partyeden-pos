<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\InventoryMovementResource;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryMovementController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', InventoryMovement::class);

        $movements = InventoryMovement::query()
            ->when($request->product_id, fn ($q, $id) => $q->where('product_id', $id))
            ->when($request->location_id, fn ($q, $id) => $q->where('location_id', $id))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->with(['product', 'variant', 'location', 'user'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return InventoryMovementResource::collection($movements);
    }
}
