<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\SupplierProduct\StoreSupplierProductRequest;
use App\Http\Requests\SupplierProduct\UpdateSupplierProductRequest;
use App\Http\Resources\SupplierProductResource;
use App\Models\Supplier;
use App\Models\SupplierProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupplierProductController extends ApiController
{
    public function index(Request $request, Supplier $supplier): AnonymousResourceCollection
    {
        $this->authorize('viewAny', SupplierProduct::class);

        $supplierProducts = $supplier->supplierProducts()
            ->with('product.category')
            ->paginate($request->integer('per_page', 15));

        return SupplierProductResource::collection($supplierProducts);
    }

    public function store(StoreSupplierProductRequest $request, Supplier $supplier): SupplierProductResource
    {
        $this->authorize('create', SupplierProduct::class);

        $data = array_merge($request->validated(), [
            'supplier_id' => $supplier->id,
        ]);

        $supplierProduct = SupplierProduct::create($data);
        $supplierProduct->load('product');

        return new SupplierProductResource($supplierProduct);
    }

    public function show(SupplierProduct $supplierProduct): SupplierProductResource
    {
        $this->authorize('view', $supplierProduct);

        $supplierProduct->load(['supplier', 'product']);

        return new SupplierProductResource($supplierProduct);
    }

    public function update(UpdateSupplierProductRequest $request, SupplierProduct $supplierProduct): SupplierProductResource
    {
        $this->authorize('update', $supplierProduct);

        $supplierProduct->update($request->validated());

        return new SupplierProductResource($supplierProduct->refresh());
    }

    public function destroy(SupplierProduct $supplierProduct): JsonResponse
    {
        $this->authorize('delete', $supplierProduct);

        $supplierProduct->delete();

        return $this->respondDeleted('Supplier product');
    }
}
