<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AdminProductImageController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
            'primary_color_id' => ['nullable', 'integer', 'exists:colors,id'],
            'addon_product_id' => ['nullable', 'uuid', 'exists:products,id'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->validateBindings($product, $validated);

        $file = $request->file('image');
        $path = $file->store("products/{$product->id}", ProductImage::storageDisk());
        $isDefaultImage = $this->bindingType($validated) === 'default';
        $isPrimary = $isDefaultImage && ! $product->defaultImages()->exists();

        try {
            $product->images()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'alt_text' => $validated['alt_text'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'variant_id' => $validated['variant_id'] ?? null,
                'primary_color_id' => $validated['primary_color_id'] ?? null,
                'addon_product_id' => $validated['addon_product_id'] ?? null,
                'is_primary' => $isPrimary,
            ]);
        } catch (\Throwable $exception) {
            // Remove the uploaded file if the database write fails mid-request.
            Storage::disk(ProductImage::storageDisk())->delete($path);

            throw $exception;
        }

        return redirect()->back()->with('success', 'Image uploaded successfully.');
    }

    public function update(Request $request, Product $product, ProductImage $productImage)
    {
        abort_if($productImage->product_id !== $product->id, Response::HTTP_NOT_FOUND);

        $validated = $request->validate([
            'variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
            'primary_color_id' => ['nullable', 'integer', 'exists:colors,id'],
            'addon_product_id' => ['nullable', 'uuid', 'exists:products,id'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->validateBindings($product, $validated);

        $productImage->update([
            'variant_id' => $validated['variant_id'] ?? null,
            'primary_color_id' => $validated['primary_color_id'] ?? null,
            'addon_product_id' => $validated['addon_product_id'] ?? null,
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_primary' => false,
        ]);

        $this->syncPrimaryDefaultImage($product);

        return redirect()->back()->with('success', 'Image updated successfully.');
    }

    public function setPrimary(Product $product, ProductImage $productImage)
    {
        abort_if($productImage->product_id !== $product->id, Response::HTTP_NOT_FOUND);
        abort_if(! $productImage->isDefaultImage(), Response::HTTP_UNPROCESSABLE_ENTITY);

        $product->images()->update(['is_primary' => false]);
        $productImage->update(['is_primary' => true]);

        return redirect()->back()->with('success', 'Primary image updated.');
    }

    public function destroy(Product $product, ProductImage $productImage)
    {
        abort_if($productImage->product_id !== $product->id, Response::HTTP_NOT_FOUND);

        Storage::disk(ProductImage::storageDisk())->delete($productImage->file_path);

        $productImage->delete();

        $this->syncPrimaryDefaultImage($product);

        return redirect()->back()->with('success', 'Image deleted.');
    }

    private function validateBindings(Product $product, array $validated): void
    {
        $selectedBindings = array_filter([
            'variant_id' => $validated['variant_id'] ?? null,
            'primary_color_id' => $validated['primary_color_id'] ?? null,
            'addon_product_id' => $validated['addon_product_id'] ?? null,
        ], static fn ($value) => $value !== null && $value !== '');

        if (count($selectedBindings) > 1) {
            throw ValidationException::withMessages([
                'variant_id' => 'An image can only be bound to one target at a time.',
            ]);
        }

        if (isset($selectedBindings['variant_id'])) {
            $variantBelongsToProduct = Variant::query()
                ->whereKey($validated['variant_id'])
                ->where('product_id', $product->id)
                ->exists();

            if (! $variantBelongsToProduct) {
                throw ValidationException::withMessages([
                    'variant_id' => 'Select a variant that belongs to this product.',
                ]);
            }
        }

        if (isset($selectedBindings['primary_color_id'])) {
            $colorBelongsToProduct = $product->mainColors()
                ->where('color_id', $validated['primary_color_id'])
                ->exists();

            if (! $colorBelongsToProduct) {
                throw ValidationException::withMessages([
                    'primary_color_id' => 'Select a primary color already assigned to this product.',
                ]);
            }
        }

        if (isset($selectedBindings['addon_product_id'])) {
            $addonBelongsToProduct = $product->addOns()
                ->where('products.id', $validated['addon_product_id'])
                ->wherePivot('is_active', true)
                ->exists();

            if (! $addonBelongsToProduct) {
                throw ValidationException::withMessages([
                    'addon_product_id' => 'Select an active addon that belongs to this product.',
                ]);
            }
        }
    }

    private function bindingType(array $validated): string
    {
        if (! empty($validated['addon_product_id'])) {
            return 'addon';
        }

        if (! empty($validated['variant_id'])) {
            return 'variant';
        }

        if (! empty($validated['primary_color_id'])) {
            return 'primary_color';
        }

        return 'default';
    }

    private function syncPrimaryDefaultImage(Product $product): void
    {
        $product->defaultImages()->update(['is_primary' => false]);

        /** @var ProductImage|null $replacementImage */
        $replacementImage = $product->defaultImages()
            ->orderByDesc('is_primary')
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->first();

        $replacementImage?->update(['is_primary' => true]);
    }
}
