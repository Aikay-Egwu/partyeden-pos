<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCustomerReviewRequest;
use App\Models\CustomerReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = CustomerReview::query()
            ->with(['product', 'occasion'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('feedback', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => $reviews,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(CustomerReview $review): Response
    {
        $review->load(['product', 'occasion']);

        return Inertia::render('admin/reviews/show', [
            'review' => [
                ...$review->toArray(),
                'image_url' => $review->image_path ? Storage::url($review->image_path) : null,
            ],
        ]);
    }

    public function update(UpdateCustomerReviewRequest $request, CustomerReview $review): RedirectResponse
    {
        $validated = $request->validated();

        $review->update([
            'status' => $validated['status'],
            'is_featured' => $validated['status'] === 'approved'
                ? ($validated['is_featured'] ?? false)
                : false,
            'show_in_gallery' => $validated['status'] === 'approved'
                ? ($validated['show_in_gallery'] ?? false)
                : false,
            'approved_at' => $validated['status'] === 'approved' ? now() : null,
        ]);

        return redirect()->route('reviews.show', $review)
            ->with('success', 'Review updated successfully.');
    }
}
