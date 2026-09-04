<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\ProductImage\StoreProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends ApiController
{
    public function index(Product $product): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ProductImage::class);

        $images = $product->images()->orderBy('sort_order')->get();

        return ProductImageResource::collection($images);
    }

    public function store(StoreProductImageRequest $request, Product $product): ProductImageResource
    {
        $this->authorize('create', ProductImage::class);

        $file = $request->file('file');
        $path = $file->store('products/images', 'public');

        // If this is set as primary, unset other primaries
        if ($request->boolean('is_primary')) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'alt_text' => $request->input('alt_text'),
            'sort_order' => $request->integer('sort_order', 0),
            'is_primary' => $request->boolean('is_primary', false),
        ]);

        return new ProductImageResource($image);
    }

    public function setPrimary(Product $product, ProductImage $productImage): JsonResponse
    {
        $this->authorize('update', $productImage);

        $product->images()->update(['is_primary' => false]);
        $productImage->update(['is_primary' => true]);

        return response()->json(['message' => 'Primary image updated.']);
    }

    public function reorder(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', ProductImage::class);

        $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['string', 'exists:product_images,id'],
        ]);

        foreach ($request->input('order') as $index => $imageId) {
            ProductImage::where('id', $imageId)
                ->where('product_id', $product->id)
                ->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Images reordered.']);
    }

    public function destroy(Product $product, ProductImage $productImage): JsonResponse
    {
        $this->authorize('delete', $productImage);

        Storage::disk('public')->delete($productImage->file_path);
        $productImage->delete();

        return $this->respondDeleted('Product image');
    }
}
