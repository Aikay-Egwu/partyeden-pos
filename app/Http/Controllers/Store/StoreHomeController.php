<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\CustomerReview;
use App\Models\Occasion;
use App\Models\Product;
use App\Services\BestSellerService;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Storefront home page controller.
 * Provides categories, best sellers, and latest products for the landing page.
 */
class StoreHomeController extends Controller
{
    public function index(BestSellerService $bestSellerService): Response
    {
        // Shared product query builder for active products with images
        $baseProductQuery = fn () => Product::onlineVisible()->where('is_active', true)
            ->with(['category', 'images' => fn ($q) => $q
                ->whereNull('variant_id')
                ->whereNull('primary_color_id')
                ->whereNull('addon_product_id')
                ->orderByDesc('is_primary')
                ->orderBy('sort_order')]);

        // Map a product to the frontend shape
        $mapProduct = fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'sku' => $p->sku,
            'selling_price' => $p->selling_price,
            'product_type' => $p->product_type,
            'is_active' => $p->is_active,
            'category' => $p->category?->only(['id', 'name']),
            'primary_image' => $p->images->first()?->url,
        ];

        return Inertia::render('store/home', [
            'occasions' => Occasion::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->take(8)
                ->get()
                ->map(fn (Occasion $occasion) => [
                    'id' => $occasion->id,
                    'name' => $occasion->name,
                    'slug' => $occasion->slug,
                    'image' => $occasion->image_path ? Storage::url($occasion->image_path) : null,
                ]),
            // Top-level active categories for the featured grid
            'categories' => Category::whereNull('parent_id')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug', 'image_path']),
            // Best sellers carousel (same query for now; replace with sales-sorted later)
            'bestSellers' => $bestSellerService
                ->topProducts(10)
                ->map($mapProduct)
                ->values(),
            // Latest products for recently viewed / bottom section
            'latestProducts' => $baseProductQuery()
                ->latest()
                ->take(8)
                ->get()
                ->map($mapProduct),
            'featuredTestimonials' => CustomerReview::query()
                ->approved()
                ->where('is_featured', true)
                ->with(['occasion', 'product'])
                ->latest('approved_at')
                ->take(8)
                ->get()
                ->map(fn (CustomerReview $review) => [
                    'id' => $review->id,
                    'name' => $review->name,
                    'role' => $review->occasion?->name ?? $review->product?->name,
                    'quote' => $review->feedback,
                    'rating' => $review->rating,
                    'avatar' => $review->image_path ? Storage::url($review->image_path) : null,
                ]),
            'galleryPreview' => CustomerReview::query()
                ->approved()
                ->where('show_in_gallery', true)
                ->whereNotNull('image_path')
                ->with(['occasion', 'product'])
                ->latest('approved_at')
                ->take(6)
                ->get()
                ->map(fn (CustomerReview $review) => [
                    'id' => $review->id,
                    'src' => Storage::url($review->image_path),
                    'alt' => $review->title ?: $review->name.' celebration photo',
                    'label' => $review->occasion?->name ?? $review->product?->name ?? 'Party Eden',
                ]),
            'latestBlogPosts' => BlogPost::query()
                ->published()
                ->with('author')
                ->latest('published_at')
                ->take(3)
                ->get()
                ->map(fn (BlogPost $blogPost) => [
                    'id' => $blogPost->id,
                    'title' => $blogPost->title,
                    'slug' => $blogPost->slug,
                    'excerpt' => $blogPost->excerpt,
                    'cover_image' => $blogPost->cover_image_path ? Storage::url($blogPost->cover_image_path) : null,
                    'published_at' => $blogPost->published_at?->toDateString(),
                ]),
        ]);
    }
}
