<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\AuditLog;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%")
                    ->orWhere('barcode', 'like', "%{$s}%");
            }))
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->product_type, fn ($q, $type) => $q->where('product_type', $type))
            // Only apply boolean filters when the parameter is actually present —
            // $request->boolean() never returns null, so a !== null check always filtered
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->has('track_inventory'), fn ($q) => $q->where('track_inventory', $request->boolean('track_inventory')))
            ->with(['category', 'taxCategory', 'variants'])
            ->withCount('variants')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $this->authorize('create', Product::class);

        $product = Product::create($request->validated());

        AuditLog::create([
            'event' => 'created',
            'auditable_type' => Product::class,
            'auditable_id' => $product->id,
            'user_id' => $request->user()?->id,
            'new_values' => $product->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'description' => 'Product created: '.$product->name,
        ]);

        return new ProductResource($product->load(['category', 'taxCategory']));
    }

    public function show(Product $product): ProductResource
    {
        $this->authorize('view', $product);

        $product->load(['category', 'taxCategory', 'variants', 'images', 'kitMappings']);

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $product->update($request->validated());

        return new ProductResource($product->refresh()->load(['category', 'taxCategory']));
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $product->delete();

        return $this->respondDeleted('Product');
    }

    public function toggleActive(Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $product->update(['is_active' => ! $product->is_active]);

        return new ProductResource($product->refresh());
    }

    public function duplicate(Product $product): ProductResource
    {
        $this->authorize('create', Product::class);

        $newProduct = $product->replicate(['sku', 'barcode']);
        $newProduct->sku = $product->sku.'-copy-'.now()->format('Ymd');
        $newProduct->name = $product->name.' (Copy)';
        $newProduct->is_active = false;
        $newProduct->save();

        AuditLog::create([
            'event' => 'created',
            'auditable_type' => Product::class,
            'auditable_id' => $newProduct->id,
            'user_id' => request()->user()?->id,
            'new_values' => $newProduct->fresh()->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => 'Product duplicated from '.$product->name,
        ]);

        return new ProductResource($newProduct->load(['category', 'taxCategory']));
    }
}
