<?php

use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\AttributeValueController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ComponentController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\CustomerAddressController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\GiftCardController;
use App\Http\Controllers\Api\GiftCardTransactionController;
use App\Http\Controllers\Api\InventoryBalanceController;
use App\Http\Controllers\Api\InventoryMovementController;
use App\Http\Controllers\Api\KitMappingController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\LoyaltyAccountController;
use App\Http\Controllers\Api\LoyaltyTransactionController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\PriceHistoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductImageController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\PurchaseOrderItemController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\ReturnedItemController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StockReservationController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SupplierProductController;
use App\Http\Controllers\Api\TaxCategoryController;
use App\Http\Controllers\Api\TillSessionController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransactionItemController;
use App\Http\Controllers\Api\TransactionPaymentController;
use App\Http\Controllers\Api\VariantAttributeController;
use App\Http\Controllers\Api\VariantController;
use App\Http\Controllers\Store\StorePaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('v1')->name('api.')->group(function () {

    // ── Tax Categories ──────────────────────────────────────────────
    Route::apiResource('tax-categories', TaxCategoryController::class);

    // ── Categories ──────────────────────────────────────────────────
    Route::apiResource('categories', CategoryController::class);
    Route::get('categories-tree', [CategoryController::class, 'tree']);

    // ── Products ────────────────────────────────────────────────────
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{product}/toggle-active', [ProductController::class, 'toggleActive']);
    Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate']);

    // ── Variants (nested under product) ─────────────────────────────
    Route::apiResource('products.variants', VariantController::class);

    // ── Product Images (nested under product) ───────────────────────
    Route::get('products/{product}/images', [ProductImageController::class, 'index']);
    Route::post('products/{product}/images', [ProductImageController::class, 'store']);
    Route::patch('products/{product}/images/{productImage}/set-primary', [ProductImageController::class, 'setPrimary']);
    Route::patch('products/{product}/images/reorder', [ProductImageController::class, 'reorder']);
    Route::delete('products/{product}/images/{productImage}', [ProductImageController::class, 'destroy']);

    // ── Components ──────────────────────────────────────────────────
    Route::apiResource('components', ComponentController::class);

    // ── Kit Mappings (scoped to kit product) ────────────────────────
    Route::apiResource('products.kit-mappings', KitMappingController::class)
        ->only(['index', 'store']);
    Route::apiResource('kit-mappings', KitMappingController::class)
        ->only(['show', 'update', 'destroy']);

    // ── Price History ───────────────────────────────────────────────
    Route::apiResource('price-histories', PriceHistoryController::class)
        ->only(['index', 'store']);

    // ── Attributes ──────────────────────────────────────────────────
    Route::apiResource('attributes', AttributeController::class);

    // ── Attribute Values (nested under attribute) ───────────────────
    Route::apiResource('attributes.values', AttributeValueController::class);

    // ── Variant Attributes ──────────────────────────────────────────
    Route::get('variants/{variant}/attributes', [VariantAttributeController::class, 'index']);
    Route::post('variant-attributes', [VariantAttributeController::class, 'store']);
    Route::delete('variant-attributes/{variantAttribute}', [VariantAttributeController::class, 'destroy']);

    // ── Countries ───────────────────────────────────────────────────
    Route::apiResource('countries', CountryController::class);
    Route::get('countries-active', [CountryController::class, 'active']);

    // ── Customers ───────────────────────────────────────────────────
    Route::apiResource('customers', CustomerController::class);
    Route::get('customers-search', [CustomerController::class, 'search']);

    // ── Customer Addresses (nested under customer) ──────────────────
    Route::apiResource('customers.addresses', CustomerAddressController::class);
    Route::patch('customers/{customer}/addresses/{customerAddress}/set-default', [CustomerAddressController::class, 'setDefault']);

    // ── Loyalty Accounts (per customer) ─────────────────────────────
    Route::get('customers/{customer}/loyalty-account', [LoyaltyAccountController::class, 'show']);
    Route::post('loyalty-accounts/{loyaltyAccount}/adjust', [LoyaltyAccountController::class, 'adjust']);
    Route::post('loyalty-accounts/{loyaltyAccount}/deactivate', [LoyaltyAccountController::class, 'deactivate']);

    // ── Loyalty Transactions (nested under account) ─────────────────
    Route::apiResource('loyalty-accounts.transactions', LoyaltyTransactionController::class)
        ->only(['index', 'store']);

    // ── Gift Cards ──────────────────────────────────────────────────
    Route::apiResource('gift-cards', GiftCardController::class);
    Route::post('gift-cards/{giftCard}/adjust-balance', [GiftCardController::class, 'adjustBalance']);

    // ── Gift Card Transactions (nested under gift card) ─────────────
    Route::apiResource('gift-cards.transactions', GiftCardTransactionController::class)
        ->only(['index']);

    // ── Suppliers ───────────────────────────────────────────────────
    Route::apiResource('suppliers', SupplierController::class);

    // ── Supplier Products (nested under supplier) ───────────────────
    Route::apiResource('suppliers.products', SupplierProductController::class)
        ->only(['index', 'store']);
    Route::apiResource('supplier-products', SupplierProductController::class)
        ->only(['show', 'update', 'destroy']);

    // ── Purchase Orders ─────────────────────────────────────────────
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::post('purchase-orders/{purchaseOrder}/duplicate', [PurchaseOrderController::class, 'duplicate']);

    // ── Purchase Order Items (nested under PO) ──────────────────────
    Route::apiResource('purchase-orders.items', PurchaseOrderItemController::class);
    Route::patch('purchase-order-items/{purchaseOrderItem}/mark-received', [PurchaseOrderItemController::class, 'markReceived']);

    // ── Locations ───────────────────────────────────────────────────
    Route::apiResource('locations', LocationController::class);

    // ── Inventory Balances ──────────────────────────────────────────
    Route::apiResource('inventory-balances', InventoryBalanceController::class)
        ->only(['index', 'show']);
    Route::post('inventory-balances/{inventoryBalance}/adjust', [InventoryBalanceController::class, 'adjust']);

    // ── Inventory Movements ─────────────────────────────────────────
    Route::apiResource('inventory-movements', InventoryMovementController::class)
        ->only(['index']);

    // ── Stock Reservations ──────────────────────────────────────────
    Route::apiResource('stock-reservations', StockReservationController::class);
    Route::post('stock-reservations/{stockReservation}/release', [StockReservationController::class, 'release']);
    Route::post('stock-reservations/{stockReservation}/extend', [StockReservationController::class, 'extend']);

    // ── Transactions ────────────────────────────────────────────────
    Route::apiResource('transactions', TransactionController::class)
        ->only(['index', 'store', 'show']);
    Route::post('transactions/{transaction}/void', [TransactionController::class, 'void']);
    Route::get('transactions-summary', [TransactionController::class, 'summary']);

    // ── Transaction Items (nested under transaction) ────────────────
    Route::get('transactions/{transaction}/items', [TransactionItemController::class, 'index']);
    Route::get('transaction-items/{transactionItem}', [TransactionItemController::class, 'show']);

    // ── Transaction Payments (nested under transaction) ─────────────
    Route::get('transactions/{transaction}/payments', [TransactionPaymentController::class, 'index']);

    // ── Discounts ───────────────────────────────────────────────────
    Route::apiResource('discounts', DiscountController::class);
    Route::patch('discounts/{discount}/toggle-active', [DiscountController::class, 'toggleActive']);
    Route::get('discounts/{discount}/usage-report', [DiscountController::class, 'usageReport']);

    // ── Till Sessions ───────────────────────────────────────────────
    Route::apiResource('till-sessions', TillSessionController::class)
        ->only(['index', 'show']);
    Route::post('till-sessions/open', [TillSessionController::class, 'open']);
    Route::post('till-sessions/{tillSession}/close', [TillSessionController::class, 'close']);
    Route::get('till-sessions-current', [TillSessionController::class, 'current']);

    // ── Returns ─────────────────────────────────────────────────────
    Route::apiResource('returns', ReturnController::class);
    Route::post('returns/{return}/approve', [ReturnController::class, 'approve']);
    Route::post('returns/{return}/complete', [ReturnController::class, 'complete']);
    Route::post('returns/{return}/reject', [ReturnController::class, 'reject']);

    // ── Returned Items (nested under return) ────────────────────────
    Route::get('returns/{return}/items', [ReturnedItemController::class, 'index']);
    Route::post('returns/{return}/items', [ReturnedItemController::class, 'store']);
    Route::get('returned-items/{returnedItem}', [ReturnedItemController::class, 'show']);
    Route::delete('returned-items/{returnedItem}', [ReturnedItemController::class, 'destroy']);

    // ── Orders ──────────────────────────────────────────────────────
    Route::apiResource('orders', OrderController::class);
    Route::post('orders/{order}/confirm', [OrderController::class, 'confirm']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('orders/{order}/mark-paid', [OrderController::class, 'markPaid']);

    // ── Order Items (nested under order) ────────────────────────────
    Route::get('orders/{order}/items', [OrderItemController::class, 'index']);
    Route::post('orders/{order}/items', [OrderItemController::class, 'store']);
    Route::get('order-items/{orderItem}', [OrderItemController::class, 'show']);
    Route::put('order-items/{orderItem}', [OrderItemController::class, 'update']);
    Route::delete('order-items/{orderItem}', [OrderItemController::class, 'destroy']);
    Route::patch('order-items/{orderItem}/fulfill', [OrderItemController::class, 'fulfill']);

    // ── Shipments ───────────────────────────────────────────────────
    Route::apiResource('shipments', ShipmentController::class);
    Route::post('shipments/{shipment}/mark-shipped', [ShipmentController::class, 'markShipped']);
    Route::post('shipments/{shipment}/mark-delivered', [ShipmentController::class, 'markDelivered']);
    Route::get('shipments/{shipment}/track', [ShipmentController::class, 'track']);

    // ── Staff ───────────────────────────────────────────────────────
    Route::apiResource('staff', StaffController::class);
    Route::post('staff/{staff}/deactivate', [StaffController::class, 'deactivate']);
    Route::get('staff/{staff}/sales-report', [StaffController::class, 'salesReport']);
    Route::get('staff/{staff}/transactions', [StaffController::class, 'transactions']);

    // ── Audit Logs ──────────────────────────────────────────────────
    Route::apiResource('audit-logs', AuditLogController::class)
        ->only(['index', 'show']);

    // ── Search ──────────────────────────────────────────────────────
    Route::get('search', SearchController::class);

    // ── Reports ─────────────────────────────────────────────────────
    Route::get('reports/sales-summary', [ReportController::class, 'salesSummary']);
    Route::get('reports/inventory-valuation', [ReportController::class, 'inventoryValuation']);
    Route::get('reports/low-stock', [ReportController::class, 'lowStockAlert']);
    Route::get('reports/top-products', [ReportController::class, 'topProducts']);
    Route::get('reports/staff-performance', [ReportController::class, 'staffPerformance']);

    // ── Dashboard ───────────────────────────────────────────────────
    Route::get('dashboard', DashboardController::class);
});

// ── PayPal Webhook (no auth — called by PayPal servers) ──────────────
Route::post('paypal/webhook', [StorePaymentController::class, 'handleWebhook'])
    ->name('api.paypal.webhook');
