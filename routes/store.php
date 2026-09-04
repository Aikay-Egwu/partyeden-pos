<?php

use App\Http\Controllers\Store\StoreBlogController;
use App\Http\Controllers\Store\StoreCartController;
use App\Http\Controllers\Store\StoreCategoryController;
use App\Http\Controllers\Store\StoreCheckoutController;
use App\Http\Controllers\Store\StoreOccasionController;
use App\Http\Controllers\Store\StoreOrderController;
use App\Http\Controllers\Store\StorePaymentController;
use App\Http\Controllers\Store\StoreProductController;
use App\Http\Controllers\Store\StoreReviewController;
use Illuminate\Support\Facades\Route;

// ── Public storefront at root (no auth required) ────────────────────
// All routes are rate limited: browsing gets a generous limit while
// mutation and lookup endpoints get progressively stricter limits.

// Browsing pages (products, categories, occasions, reviews, blog, cart view)
Route::middleware('throttle:60,1')->group(function (): void {
    // Products
    Route::get('products', [StoreProductController::class, 'index'])->name('store.products');
    Route::get('products/{product}', [StoreProductController::class, 'show'])->name('store.products.show');

    // Categories
    Route::get('categories/{category}', [StoreCategoryController::class, 'show'])->name('store.categories.show');

    // Occasions
    Route::get('occasions', [StoreOccasionController::class, 'index'])->name('store.occasions.index');
    Route::get('occasions/{occasion:slug}', [StoreOccasionController::class, 'show'])->name('store.occasions.show');

    // Reviews and gallery (read-only)
    Route::get('reviews', [StoreReviewController::class, 'index'])->name('store.reviews.index');
    Route::get('gallery', [StoreReviewController::class, 'gallery'])->name('store.gallery.index');

    // Blog
    Route::get('blog', [StoreBlogController::class, 'index'])->name('store.blog.index');
    Route::get('blog/{blogPost:slug}', [StoreBlogController::class, 'show'])->name('store.blog.show');

    // Cart view + checkout view
    Route::get('cart', [StoreCartController::class, 'index'])->name('store.cart');
    Route::get('checkout', [StoreCheckoutController::class, 'index'])->name('store.checkout');

    // Order tracking (requires order number + matching email)
    Route::get('orders/track', [StoreOrderController::class, 'track'])->name('store.orders.track');

    // Order confirmation — only reachable via the signed URL issued at order placement
    Route::get('orders/{order}/confirmation', [StoreOrderController::class, 'confirmation'])
        ->middleware('signed')
        ->name('store.orders.confirmation');
});

// Cart mutations (session-based)
Route::middleware('throttle:30,1')->group(function (): void {
    Route::post('cart/add', [StoreCartController::class, 'add'])->name('store.cart.add');
    Route::patch('cart/update', [StoreCartController::class, 'update'])->name('store.cart.update');
    Route::delete('cart/remove', [StoreCartController::class, 'remove'])->name('store.cart.remove');
});

// Checkout lookups (debounced client-side; keep the limit tight)
Route::middleware('throttle:15,1')->group(function (): void {
    Route::get('checkout/delivery-zone', [StoreCheckoutController::class, 'lookupDeliveryZone'])->name('store.checkout.delivery-zone');
    Route::get('checkout/loyalty-account', [StoreCheckoutController::class, 'lookupLoyalty'])->name('store.checkout.loyalty-account');
});

// Order placement + PayPal payment (strict limit — money-touching endpoints)
Route::middleware('throttle:10,1')->group(function (): void {
    Route::post('orders', [StoreOrderController::class, 'store'])->name('store.orders.store');
    Route::post('payment/create-order', [StorePaymentController::class, 'createOrder'])
        ->name('store.payment.create-order');
    Route::post('payment/capture-order', [StorePaymentController::class, 'captureOrder'])
        ->name('store.payment.capture-order');
});

// Public review submission (anonymous + file upload — strictest limit)
Route::post('reviews', [StoreReviewController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('store.reviews.store');
