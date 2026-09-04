<?php

use App\Http\Controllers\Admin\AdminAttributeController;
use App\Http\Controllers\Admin\AdminAttributeValueController;
use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminBlogPostController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminColorController;
use App\Http\Controllers\Admin\AdminComponentController;
use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminDeliveryZoneController;
use App\Http\Controllers\Admin\AdminDiscountController;
use App\Http\Controllers\Admin\AdminGiftCardController;
use App\Http\Controllers\Admin\AdminInventoryController;
use App\Http\Controllers\Admin\AdminLocationController;
use App\Http\Controllers\Admin\AdminLoyaltyController;
use App\Http\Controllers\Admin\AdminOccasionController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminProductImageController;
use App\Http\Controllers\Admin\AdminPurchaseOrderController;
use App\Http\Controllers\Admin\AdminReturnController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminShipmentController;
use App\Http\Controllers\Admin\AdminSkuController;
use App\Http\Controllers\Admin\AdminStaffController;
use App\Http\Controllers\Admin\AdminStockReservationController;
use App\Http\Controllers\Admin\AdminSupplierController;
use App\Http\Controllers\Admin\AdminTaxCategoryController;
use App\Http\Controllers\Admin\AdminTillSessionController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\AdminVariantController;
use Illuminate\Support\Facades\Route;

// All admin routes behind auth + admin gate
Route::middleware(['auth', 'verified', 'can:admin'])->prefix('admin')->group(function () {
    // Admin dashboard home - shows overview stats
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // ── Catalog ─────────────────────────────────────────────────────
    Route::get('skus/generate', [AdminSkuController::class, 'generate'])->name('skus.generate');
    Route::resource('products', AdminProductController::class);
    Route::post('products/{product}/duplicate', [AdminProductController::class, 'duplicate'])->name('products.duplicate');
    Route::post('products/{product}/kit-mappings', [AdminProductController::class, 'updateKitMappings'])->name('products.kit-mappings.update');
    Route::post('products/{product}/add-ons', [AdminProductController::class, 'updateAddOns'])->name('products.add-ons.update');
    Route::post('products/{product}/colors', [AdminProductController::class, 'updateColors'])->name('products.colors.update');
    Route::post('products/{product}/colors/create', [AdminProductController::class, 'storeColor'])->name('products.colors.store');
    Route::post('products/{product}/setup-instruction', [AdminProductController::class, 'updateSetupInstruction'])->name('products.setup-instruction.update');
    Route::post('products/{product}/stock', [AdminProductController::class, 'updateStock'])->name('products.stock.update');
    Route::post('products/{product}/images', [AdminProductImageController::class, 'store'])->name('products.images.store');
    Route::patch('products/{product}/images/{productImage}', [AdminProductImageController::class, 'update'])->name('products.images.update');
    Route::patch('products/{product}/images/{productImage}/primary', [AdminProductImageController::class, 'setPrimary'])->name('products.images.primary');
    Route::delete('products/{product}/images/{productImage}', [AdminProductImageController::class, 'destroy'])->name('products.images.destroy');
    Route::post('products/{product}/variants', [AdminVariantController::class, 'store'])->name('products.variants.store');
    Route::put('products/{product}/variants/{variant}', [AdminVariantController::class, 'update'])->name('products.variants.update');
    Route::delete('products/{product}/variants/{variant}', [AdminVariantController::class, 'destroy'])->name('products.variants.destroy');
    Route::resource('components', AdminComponentController::class);
    Route::resource('categories', AdminCategoryController::class);
    Route::resource('occasions', AdminOccasionController::class);
    Route::resource('attributes', AdminAttributeController::class);
    Route::post('attributes/{attribute}/values', [AdminAttributeValueController::class, 'store'])->name('attributes.values.store');
    Route::put('attributes/{attribute}/values/{attribute_value}', [AdminAttributeValueController::class, 'update'])->name('attributes.values.update');
    Route::delete('attributes/{attribute}/values/{attribute_value}', [AdminAttributeValueController::class, 'destroy'])->name('attributes.values.destroy');
    Route::resource('tax-categories', AdminTaxCategoryController::class);
    Route::resource('colors', AdminColorController::class);
    Route::resource('blog-posts', AdminBlogPostController::class)->parameters([
        'blog-posts' => 'blog_post',
    ]);

    // ── Inventory ───────────────────────────────────────────────────
    Route::resource('locations', AdminLocationController::class);
    Route::get('inventory', [AdminInventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/{id}/adjust', [AdminInventoryController::class, 'adjust'])->name('inventory.adjust');
    Route::post('inventory/{id}/adjust', [AdminInventoryController::class, 'storeAdjustment'])->name('inventory.adjust.store');
    Route::resource('stock-reservations', AdminStockReservationController::class);

    // ── Purchasing ──────────────────────────────────────────────────
    Route::resource('suppliers', AdminSupplierController::class);
    Route::resource('purchase-orders', AdminPurchaseOrderController::class);

    // ── Sales ───────────────────────────────────────────────────────
    Route::get('transactions', [AdminTransactionController::class, 'index'])->name('transactions.index');
    Route::get('transactions/{transaction}', [AdminTransactionController::class, 'show'])->name('transactions.show');
    Route::resource('discounts', AdminDiscountController::class);
    Route::resource('gift-cards', AdminGiftCardController::class);
    Route::get('till-sessions', [AdminTillSessionController::class, 'index'])->name('till-sessions.index');
    Route::get('till-sessions/{tillSession}', [AdminTillSessionController::class, 'show'])->name('till-sessions.show');

    // ── Customers ───────────────────────────────────────────────────
    Route::resource('customers', AdminCustomerController::class);
    Route::get('loyalty', [AdminLoyaltyController::class, 'index'])->name('loyalty.index');
    Route::get('loyalty/{loyaltyAccount}', [AdminLoyaltyController::class, 'show'])->name('loyalty.show');
    Route::post('loyalty/settings', [AdminLoyaltyController::class, 'updateSettings'])->name('loyalty.settings.update');
    Route::post('loyalty/{loyaltyAccount}/adjust', [AdminLoyaltyController::class, 'adjust'])->name('loyalty.adjust');
    Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::get('reviews/{review}', [AdminReviewController::class, 'show'])->name('reviews.show');
    Route::patch('reviews/{review}', [AdminReviewController::class, 'update'])->name('reviews.update');

    // ── Orders ──────────────────────────────────────────────────────
    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/export', [AdminOrderController::class, 'export'])->name('orders.export');
    Route::post('orders/bulk-confirm', [AdminOrderController::class, 'bulkConfirm'])->name('orders.bulk-confirm');
    Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::get('orders/{order}/print', [AdminOrderController::class, 'print'])->name('orders.print');
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status.update');
    Route::resource('shipments', AdminShipmentController::class);

    // ── Returns ─────────────────────────────────────────────────────
    Route::get('returns', [AdminReturnController::class, 'index'])->name('returns.index');
    Route::get('returns/{return}', [AdminReturnController::class, 'show'])->name('returns.show');
    Route::patch('returns/{return}/status', [AdminReturnController::class, 'updateStatus'])->name('returns.status.update');
    Route::post('returns/{return}/restock', [AdminReturnController::class, 'restock'])->name('returns.restock');

    // ── Fulfilment: Delivery Zones ──────────────────────────────────
    Route::resource('delivery-zones', AdminDeliveryZoneController::class);

    // ── Staff ───────────────────────────────────────────────────────
    Route::resource('staff', AdminStaffController::class);

    // ── System ──────────────────────────────────────────────────────
    Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('audit-logs/{auditLog}', [AdminAuditLogController::class, 'show'])->name('audit-logs.show');
});
