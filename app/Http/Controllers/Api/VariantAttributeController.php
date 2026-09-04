<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\VariantAttribute\StoreVariantAttributeRequest;
use App\Http\Resources\VariantAttributeResource;
use App\Models\Variant;
use App\Models\VariantAttribute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantAttributeController extends ApiController
{
    public function index(Request $request, Variant $variant): JsonResource
    {
        $this->authorize('viewAny', VariantAttribute::class);

        $variantAttributes = $variant->variantAttributes()
            ->with('attributeValue.attribute')
            ->paginate($request->integer('per_page', 50));

        return VariantAttributeResource::collection($variantAttributes);
    }

    public function store(StoreVariantAttributeRequest $request): VariantAttributeResource
    {
        $this->authorize('create', VariantAttribute::class);

        $variantAttribute = VariantAttribute::create($request->validated());
        $variantAttribute->load('attributeValue.attribute');

        return new VariantAttributeResource($variantAttribute);
    }

    public function destroy(VariantAttribute $variantAttribute): JsonResponse
    {
        $this->authorize('delete', $variantAttribute);

        $variantAttribute->delete();

        return $this->respondDeleted('Variant attribute');
    }
}
