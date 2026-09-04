<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Storefront product browsing controller.
 * List and search products with category/sort filters.
 */
class StoreProductController extends Controller
{
    // Product listing with search, category filter, sort
    public function index(Request $request): Response
    {
        $products = Product::onlineVisible()->where('is_active', true)
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%");
            }))
            ->when($request->category, fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->sort === 'price_asc', fn ($q) => $q->orderBy('selling_price', 'asc'))
            ->when($request->sort === 'price_desc', fn ($q) => $q->orderBy('selling_price', 'desc'))
            ->when(
                $request->sort === 'newest' || ! $request->sort,
                fn ($q) => $q->latest(),
            )
            ->when($request->sort === 'name', fn ($q) => $q->orderBy('name', 'asc'))
            ->with(['category', 'images' => fn ($q) => $q
                ->orderByDesc('is_primary')
                ->orderBy('sort_order')
                ->orderBy('created_at')])
            ->paginate(12)
            ->withQueryString()
            ->through(function ($product) {
                $primaryImage = $product->images
                    ->first(fn (ProductImage $image) => $image->isDefaultImage() && $image->is_primary)
                    ?? $product->images->first(fn (ProductImage $image) => $image->isDefaultImage())
                    ?? $product->images->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'selling_price' => $product->selling_price,
                    'product_type' => $product->product_type,
                    'is_active' => $product->is_active,
                    'category' => $product->category?->only(['id', 'name']),
                    'primary_image' => $primaryImage?->url,
                ];
            });

        return Inertia::render('store/products/index', [
            'products' => $products,
            'categories' => Category::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => $request->only(['search', 'category', 'sort']),
        ]);
    }

    // Product detail with variants
    public function show(Product $product): Response
    {
        if (! $product->is_active || ! $product->is_online_visible) {
            abort(404);
        }

        $product->load([
            'category',
            'images.variant',
            'images.primaryColor',
            'images.addonProduct',
            'variants' => fn ($q) => $q->where('is_active', true)->orderBy('name'),
            'variants.variantAttributes.attributeValue.attribute',
            'variants.images',
            'mainColors' => fn ($q) => $q->with('color')->orderBy('created_at'),
            'secondaryColors' => fn ($q) => $q->with('color')->orderBy('created_at'),
            'kitMappings' => fn ($q) => $q->with(['component', 'variant'])->orderBy('created_at'),
            'addOns' => fn ($q) => $q
                ->wherePivot('is_active', true)
                ->orderByPivot('sort_order')
                ->with(['images' => fn ($imageQuery) => $imageQuery
                    ->whereNull('variant_id')
                    ->whereNull('primary_color_id')
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order')]),
        ]);

        return Inertia::render('store/products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'description' => $product->description,
                'selling_price' => $product->selling_price,
                'product_type' => $product->product_type,
                'unit' => $product->unit,
                'customise_color' => $product->customise_color,
                'customise_text' => $product->customise_text,
                'preorder' => $product->preorder,
                'category' => $product->category?->only(['id', 'name']),
                'images' => $product->images
                    // Keep gallery payload order stable for the frontend selectors.
                    ->sortBy(fn (ProductImage $image) => [
                        $this->bindingSortOrder($image),
                        $image->is_primary ? 0 : 1,
                        $image->sort_order,
                        $image->created_at?->getTimestamp() ?? 0,
                    ])
                    ->values()
                    ->map(fn (ProductImage $image) => $this->mapImage($image))
                    ->all(),
                'variants' => $product->variants
                    ->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'sku' => $variant->sku,
                            'name' => $variant->name,
                            'price_adjustment' => $variant->price_adjustment,
                            'is_active' => $variant->is_active,
                            'variant_attributes' => $variant->variantAttributes
                                ->map(fn ($variantAttribute) => [
                                    'id' => $variantAttribute->id,
                                    'attribute_value' => $variantAttribute->attributeValue ? [
                                        'id' => $variantAttribute->attributeValue->id,
                                        'value' => $variantAttribute->attributeValue->value,
                                        'attribute' => $variantAttribute->attributeValue->attribute?->only(['id', 'name']),
                                    ] : null,
                                ])->all(),
                            'images' => $variant->images
                                ->sortBy([
                                    ['sort_order', 'asc'],
                                    ['created_at', 'asc'],
                                ])
                                ->values()
                                ->map(fn (ProductImage $image) => $this->mapImage($image))
                                ->all(),
                        ];
                    })->all(),
                'main_colors' => $product->mainColors
                    ->map(fn ($entry) => [
                        'id' => $entry->id,
                        'color_id' => $entry->color_id,
                        'color' => $entry->color?->only(['id', 'name', 'hex_code']),
                    ])->all(),
                'secondary_colors' => $product->secondaryColors
                    ->map(fn ($entry) => [
                        'id' => $entry->id,
                        'color_id' => $entry->color_id,
                        'color' => $entry->color?->only(['id', 'name', 'hex_code']),
                    ])->all(),
                'kit_mappings' => $product->kitMappings
                    ->map(fn ($mapping) => [
                        'id' => $mapping->id,
                        'quantity' => $mapping->quantity,
                        'component' => $mapping->component?->only(['id', 'name']),
                        'variant' => $mapping->variant?->only(['id', 'name']),
                    ])->all(),
                'add_ons' => $product->addOns
                    ->map(function ($addOn) use ($product) {
                        // Include combo images from the main product that are bound to this add-on
                        $comboImages = $product->images
                            ->filter(fn (ProductImage $img) => $img->addon_product_id === $addOn->id
                            );

                        // Merge images: combo images first (contextual), then add-on's own images.
                        // Combo images show how the add-on looks paired with this product.
                        $allImages = $comboImages
                            ->concat($addOn->images)
                            ->sortBy('sort_order')
                            ->values();

                        return [
                            'id' => $addOn->id,
                            'name' => $addOn->name,
                            'selling_price' => $addOn->selling_price,
                            'images' => $allImages
                                ->map(fn (ProductImage $image) => $this->mapImage($image))
                                ->all(),
                        ];
                    })->all(),
            ],
        ]);
    }

    private function mapImage(ProductImage $image): array
    {
        return [
            'id' => $image->id,
            'file_name' => $image->file_name,
            'alt_text' => $image->alt_text,
            'url' => $image->url,
            'sort_order' => $image->sort_order,
            'is_primary' => $image->is_primary,
            'binding_type' => $image->bindingType(),
            'variant_id' => $image->variant_id,
            'primary_color_id' => $image->primary_color_id,
            'addon_product_id' => $image->addon_product_id,
            'variant' => $image->variant?->only(['id', 'name', 'sku']),
            'primary_color' => $image->primaryColor?->only(['id', 'name', 'hex_code']),
            'addon_product' => $image->addonProduct?->only(['id', 'name']),
        ];
    }

    private function bindingSortOrder(ProductImage $image): int
    {
        return match ($image->bindingType()) {
            'default' => 0,
            'variant' => 1,
            'primary_color' => 2,
            'addon' => 3,
            default => 4,
        };
    }
}
