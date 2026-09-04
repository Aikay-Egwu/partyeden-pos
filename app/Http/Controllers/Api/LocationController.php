<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Location\StoreLocationRequest;
use App\Http\Requests\Location\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Location::class);

        $locations = Location::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->withCount('inventoryBalances')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return LocationResource::collection($locations);
    }

    public function store(StoreLocationRequest $request): LocationResource
    {
        $this->authorize('create', Location::class);

        $location = Location::create($request->validated());

        return new LocationResource($location);
    }

    public function show(Location $location): LocationResource
    {
        $this->authorize('view', $location);

        $location->loadCount(['inventoryBalances', 'tillSessions']);

        return new LocationResource($location);
    }

    public function update(UpdateLocationRequest $request, Location $location): LocationResource
    {
        $this->authorize('update', $location);

        $location->update($request->validated());

        return new LocationResource($location->refresh());
    }

    public function destroy(Location $location): JsonResponse
    {
        $this->authorize('delete', $location);

        $location->delete();

        return $this->respondDeleted('Location');
    }
}
