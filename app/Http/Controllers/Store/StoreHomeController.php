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
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use SplFileInfo;

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
            ->with(['categories', 'images' => fn ($q) => $q
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
            'categories' => $p->categories->map(fn ($c) => $c->only(['id', 'name']))->all(),
            'primary_image' => $p->images->first()?->url,
        ];

        return Inertia::render('store/home', [
            // Hero carousel images: every image file dropped into public/carousel,
            // sorted by name. Empty list => the hero falls back to its default image.
            'heroCarousel' => collect(
                File::isDirectory(public_path('carousel'))
                    ? File::files(public_path('carousel'))
                    : []
            )
                ->filter(fn (SplFileInfo $file) => in_array(
                    strtolower($file->getExtension()),
                    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
                    true,
                ))
                ->sortBy(fn (SplFileInfo $file) => $file->getFilename())
                ->map(fn (SplFileInfo $file) => [
                    'src' => '/carousel/'.$file->getFilename(),
                    'alt' => 'Party Eden balloon display',
                ])
                ->values(),
            'occasions' => Occasion::query()
                ->where('is_active', true)
                ->where('featured', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->take(8)
                ->get()
                ->map(fn (Occasion $occasion) => [
                    'id' => $occasion->id,
                    'name' => $occasion->name,
                    'slug' => $occasion->slug,
                    'description' => $occasion->description,
                    'image' => $occasion->image_path ? Storage::url($occasion->image_path) : null,
                ]),
            // Featured top-level categories for the home page grid
            'categories' => Category::whereNull('parent_id')
                ->where('is_active', true)
                ->where('featured', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->take(5)
                ->get(['id', 'name', 'slug', 'description', 'image_path'])
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'image' => $category->image_path ? Storage::url($category->image_path) : null,
                ]),
            'categoryCount' => Category::where('is_active', true)->count(),
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
