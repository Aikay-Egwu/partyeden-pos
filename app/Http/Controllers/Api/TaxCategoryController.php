<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\TaxCategory\StoreTaxCategoryRequest;
use App\Http\Requests\TaxCategory\UpdateTaxCategoryRequest;
use App\Http\Resources\TaxCategoryResource;
use App\Models\TaxCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaxCategoryController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $taxCategories = TaxCategory::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->withCount('products')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return TaxCategoryResource::collection($taxCategories);
    }

    public function store(StoreTaxCategoryRequest $request): TaxCategoryResource
    {
        $taxCategory = TaxCategory::create($request->validated());

        return new TaxCategoryResource($taxCategory);
    }

    public function show(TaxCategory $taxCategory): TaxCategoryResource
    {
        $taxCategory->loadCount('products');

        return new TaxCategoryResource($taxCategory);
    }

    public function update(UpdateTaxCategoryRequest $request, TaxCategory $taxCategory): TaxCategoryResource
    {
        $taxCategory->update($request->validated());

        return new TaxCategoryResource($taxCategory->refresh());
    }

    public function destroy(TaxCategory $taxCategory): JsonResponse
    {
        $taxCategory->delete();

        return $this->respondDeleted('Tax category');
    }
}
