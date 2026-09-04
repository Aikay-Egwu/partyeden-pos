<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Storefront category page controller.
 * Shows sub-categories and products within a category.
 */
class StoreCategoryController extends Controller
{
    public function show(Request $request, Category $category): Response
    {
        $products = Product::onlineVisible()->where('category_id', $category->id)
            ->where('is_active', true)
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%");
            }))
            ->when($request->sort === 'price_asc', fn ($q) => $q->orderBy('selling_price', 'asc'))
            ->when($request->sort === 'price_desc', fn ($q) => $q->orderBy('selling_price', 'desc'))
            ->when(
                $request->sort === 'newest' || ! $request->sort,
                fn ($q) => $q->latest(),
            )
            ->when($request->sort === 'name', fn ($q) => $q->orderBy('name', 'asc'))
            ->with(['category', 'images' => fn ($q) => $q
                ->whereNull('variant_id')
                ->whereNull('primary_color_id')
                ->whereNull('addon_product_id')
                ->orderByDesc('is_primary')
                ->orderBy('sort_order')])
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'selling_price' => $p->selling_price,
                'product_type' => $p->product_type,
                'is_active' => $p->is_active,
                'category' => $p->category?->only(['id', 'name']),
                'primary_image' => $p->images->first()?->url,
            ]);

        return Inertia::render('store/categories/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image_path' => $category->image_path,
                // Parent breadcrumb
                'parent' => $category->parent?->only(['id', 'name', 'slug']),
            ],
            // Sub-categories
            'subCategories' => Category::where('parent_id', $category->id)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug', 'image_path']),
            // Products in this category
            'products' => $products,
            'filters' => $request->only(['search', 'sort']),
        ]);
    }
}
