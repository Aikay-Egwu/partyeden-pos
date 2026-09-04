<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\KitMapping\StoreKitMappingRequest;
use App\Http\Requests\KitMapping\UpdateKitMappingRequest;
use App\Http\Resources\KitMappingResource;
use App\Models\KitMapping;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KitMappingController extends ApiController
{
    public function index(Request $request, Product $product): JsonResource
    {
        $mappings = $product->kitMappings()
            ->with(['component', 'variant'])
            ->paginate($request->integer('per_page', 15));

        return KitMappingResource::collection($mappings);
    }

    public function store(StoreKitMappingRequest $request): KitMappingResource
    {
        $mapping = KitMapping::create($request->validated());

        return new KitMappingResource($mapping->load(['component', 'variant']));
    }

    public function show(KitMapping $kitMapping): KitMappingResource
    {
        $kitMapping->load(['kitProduct', 'component', 'variant']);

        return new KitMappingResource($kitMapping);
    }

    public function update(UpdateKitMappingRequest $request, KitMapping $kitMapping): KitMappingResource
    {
        $kitMapping->update($request->validated());

        return new KitMappingResource($kitMapping->refresh()->load(['component', 'variant']));
    }

    public function destroy(KitMapping $kitMapping): JsonResponse
    {
        $kitMapping->delete();

        return $this->respondDeleted('Kit mapping');
    }
}
