<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Occasion;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreOccasionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/occasions/index', [
            'occasions' => Occasion::query()
                ->where('is_active', true)
                ->withCount('products')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (Occasion $occasion) => [
                    'id' => $occasion->id,
                    'name' => $occasion->name,
                    'slug' => $occasion->slug,
                    'description' => $occasion->description,
                    'image' => $occasion->image_path ? Storage::url($occasion->image_path) : null,
                    'products_count' => $occasion->products_count,
                ]),
        ]);
    }

    public function show(Request $request, Occasion $occasion): Response
    {
        abort_unless($occasion->is_active, 404);

        $products = Product::query()
            ->onlineVisible()
            ->where('is_active', true)
            ->whereHas('occasions', fn ($query) => $query->where('occasions.id', $occasion->id))
            ->when($request->search, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->with([
                'category',
                'images' => fn ($query) => $query
                    ->whereNull('variant_id')
                    ->whereNull('primary_color_id')
                    ->whereNull('addon_product_id')
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order'),
            ])
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'selling_price' => $product->selling_price,
                'product_type' => $product->product_type,
                'is_active' => $product->is_active,
                'category' => $product->category?->only(['id', 'name']),
                'primary_image' => $product->images->first()?->url,
            ]);

        return Inertia::render('store/occasions/show', [
            'occasion' => [
                'id' => $occasion->id,
                'name' => $occasion->name,
                'slug' => $occasion->slug,
                'description' => $occasion->description,
                'hero_title' => $occasion->hero_title,
                'hero_text' => $occasion->hero_text,
                'image' => $occasion->image_path ? Storage::url($occasion->image_path) : null,
            ],
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }
}
