<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Attribute\StoreAttributeRequest;
use App\Http\Requests\Attribute\UpdateAttributeRequest;
use App\Http\Resources\AttributeResource;
use App\Models\Attribute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributeController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Attribute::class);

        $attributes = Attribute::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->withCount('values')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return AttributeResource::collection($attributes);
    }

    public function store(StoreAttributeRequest $request): AttributeResource
    {
        $this->authorize('create', Attribute::class);

        $attribute = Attribute::create($request->validated());

        return new AttributeResource($attribute);
    }

    public function show(Attribute $attribute): AttributeResource
    {
        $this->authorize('view', $attribute);

        $attribute->load('values');

        return new AttributeResource($attribute);
    }

    public function update(UpdateAttributeRequest $request, Attribute $attribute): AttributeResource
    {
        $this->authorize('update', $attribute);

        $attribute->update($request->validated());

        return new AttributeResource($attribute->refresh());
    }

    public function destroy(Attribute $attribute): JsonResponse
    {
        $this->authorize('delete', $attribute);

        $attribute->delete();

        return $this->respondDeleted('Attribute');
    }
}
