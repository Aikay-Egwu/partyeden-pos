<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreCustomerReviewRequest;
use App\Models\CustomerReview;
use App\Models\Occasion;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreReviewController extends Controller
{
    public function index(): Response
    {
        $approvedReviews = CustomerReview::query()
            ->approved()
            ->with(['product', 'occasion'])
            ->latest('approved_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (CustomerReview $review) => [
                'id' => $review->id,
                'name' => $review->name,
                'title' => $review->title,
                'feedback' => $review->feedback,
                'rating' => $review->rating,
                'image' => $review->image_path ? Storage::url($review->image_path) : null,
                'product' => $review->product?->only(['id', 'name']),
                'occasion' => $review->occasion?->only(['id', 'name']),
                'approved_at' => $review->approved_at?->toFormattedDateString(),
            ]);

        return Inertia::render('store/reviews/index', [
            'reviews' => $approvedReviews,
            'summary' => [
                'average_rating' => round((float) CustomerReview::query()->approved()->avg('rating'), 1),
                'total_reviews' => CustomerReview::query()->approved()->count(),
            ],
            'products' => Product::query()
                ->onlineVisible()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'occasions' => Occasion::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Review form opened from the post-delivery feedback-request email.
     * Prefills the customer's details and the products from their order.
     */
    public function create(Request $request): Response
    {
        $orderId = $request->query('order_id');
        abort_if(! is_string($orderId) || $orderId === '', 404, 'Order not found.');

        try {
            $order = Order::query()
                ->with(['customer', 'items.product'])
                ->findOrFail($orderId);
        } catch (ModelNotFoundException) {
            abort(404, 'Order not found.');
        }

        $products = $order->items
            ->map(fn ($item) => $item->product ? ['id' => $item->product->id, 'name' => $item->product->name] : null)
            ->filter()
            ->unique('id')
            ->values();

        return Inertia::render('store/reviews/create', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
            ],
            'prefill' => [
                'name' => trim($order->customer->first_name.' '.$order->customer->last_name),
                'email' => $order->customer->email,
            ],
            'products' => $products,
            'occasions' => Occasion::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreCustomerReviewRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('reviews', 'public');
            $data['show_in_gallery'] = true;
        }

        CustomerReview::create([
            ...$data,
            'status' => 'pending',
            'is_featured' => false,
            'show_in_gallery' => $data['show_in_gallery'] ?? false,
            'approved_at' => null,
        ]);

        return back()->with('success', 'Thanks for your feedback. We will review it before publishing.');
    }

    public function gallery(): Response
    {
        return Inertia::render('store/gallery/index', [
            'galleryItems' => CustomerReview::query()
                ->approved()
                ->where('show_in_gallery', true)
                ->whereNotNull('image_path')
                ->with(['product', 'occasion'])
                ->latest('approved_at')
                ->paginate(18)
                ->withQueryString()
                ->through(fn (CustomerReview $review) => [
                    'id' => $review->id,
                    'src' => Storage::url($review->image_path),
                    'alt' => $review->title ?: $review->name.' celebration photo',
                    'label' => $review->occasion?->name ?? $review->product?->name ?? 'Party Eden',
                    'feedback' => $review->feedback,
                    'name' => $review->name,
                ]),
        ]);
    }
}
