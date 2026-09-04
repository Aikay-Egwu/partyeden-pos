<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\AttributeValue\StoreAttributeValueRequest;
use App\Http\Requests\AttributeValue\UpdateAttributeValueRequest;
use App\Http\Resources\AttributeValueResource;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributeValueController extends ApiController
{
    public function index(Request $request, Attribute $attribute): JsonResource
    {
        $this->authorize('viewAny', AttributeValue::class);

        $values = $attribute->values()
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('sort_order')
            ->orderBy('value')
            ->paginate($request->integer('per_page', 50));

        return AttributeValueResource::collection($values);
    }

    public function store(StoreAttributeValueRequest $request, Attribute $attribute): AttributeValueResource
    {
        $this->authorize('create', AttributeValue::class);

        $value = $attribute->values()->create($request->validated());

        return new AttributeValueResource($value);
    }

    public function show(AttributeValue $attributeValue): AttributeValueResource
    {
        $this->authorize('view', $attributeValue);

        $attributeValue->load('attribute');

        return new AttributeValueResource($attributeValue);
    }

    public function update(UpdateAttributeValueRequest $request, AttributeValue $attributeValue): AttributeValueResource
    {
        $this->authorize('update', $attributeValue);

        $attributeValue->update($request->validated());

        return new AttributeValueResource($attributeValue->refresh());
    }

    public function destroy(AttributeValue $attributeValue): JsonResponse
    {
        $this->authorize('delete', $attributeValue);

        $attributeValue->delete();

        return $this->respondDeleted('Attribute value');
    }
}
