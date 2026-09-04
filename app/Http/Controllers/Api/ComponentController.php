<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Component\StoreComponentRequest;
use App\Http\Requests\Component\UpdateComponentRequest;
use App\Http\Resources\ComponentResource;
use App\Models\Component;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComponentController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $components = Component::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%");
            }))
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->withCount('kitMappings')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return ComponentResource::collection($components);
    }

    public function store(StoreComponentRequest $request): ComponentResource
    {
        $component = Component::create($request->validated());

        return new ComponentResource($component);
    }

    public function show(Component $component): ComponentResource
    {
        $component->loadCount('kitMappings');

        return new ComponentResource($component);
    }

    public function update(UpdateComponentRequest $request, Component $component): ComponentResource
    {
        $component->update($request->validated());

        return new ComponentResource($component->refresh());
    }

    public function destroy(Component $component): JsonResponse
    {
        $component->delete();

        return $this->respondDeleted('Component');
    }
}
