<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Variant\StoreVariantRequest;
use App\Http\Requests\Variant\UpdateVariantRequest;
use App\Http\Resources\VariantResource;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantController extends ApiController
{
    public function index(Request $request, Product $product): JsonResource
    {
        $variants = $product->variants()
            ->with('attributeValues')
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return VariantResource::collection($variants);
    }

    public function store(StoreVariantRequest $request): VariantResource
    {
        $variant = Variant::create($request->validated());

        return new VariantResource($variant->load('attributeValues'));
    }

    public function show(Variant $variant): VariantResource
    {
        $variant->load(['product', 'attributeValues']);

        return new VariantResource($variant);
    }

    public function update(UpdateVariantRequest $request, Variant $variant): VariantResource
    {
        $variant->update($request->validated());

        return new VariantResource($variant->refresh()->load('attributeValues'));
    }

    public function destroy(Variant $variant): JsonResponse
    {
        $variant->delete();

        return $this->respondDeleted('Variant');
    }
}
