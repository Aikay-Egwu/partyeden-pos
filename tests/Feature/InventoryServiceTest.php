<?php

declare(strict_types=1);

use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockReservation;
use App\Models\Variant;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Build a location + tracked product + balance + order with one item.
 *
 * @return array{location: Location, product: Product, balance: InventoryBalance, order: Order}
 */
function makeInventoryFixture(float $onHand = 10.0, float $orderedQty = 2.0): array
{
    $location = Location::create([
        'name' => 'Main Warehouse',
        'code' => 'MAIN',
        'is_active' => true,
    ]);

    $product = Product::factory()->create([
        'is_active' => true,
        'track_inventory' => true,
        'selling_price' => '20.00',
    ]);

    $balance = InventoryBalance::create([
        'product_id' => $product->id,
        'variant_id' => null,
        'location_id' => $location->id,
        'quantity' => $onHand,
        'reserved_quantity' => 0,
    ]);

    $order = Order::create([
        'order_number' => 'ORD-TEST-'.uniqid(),
        'status' => 'pending',
        'location_id' => $location->id,
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => $product->name,
        'quantity' => $orderedQty,
        'unit_price' => '20.0000',
        'total' => '40.0000',
    ]);

    return compact('location', 'product', 'balance', 'order');
}

test('reserveForOrder creates a reservation and bumps reserved_quantity', function (): void {
    ['balance' => $balance, 'product' => $product, 'order' => $order] = makeInventoryFixture();

    app(InventoryService::class)->reserveForOrder($order);

    expect((float) $balance->fresh()->quantity)->toBe(10.0)
        ->and((float) $balance->fresh()->reserved_quantity)->toBe(2.0);

    $this->assertDatabaseHas('stock_reservations', [
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => '2.0000',
    ]);
});

test('convertReservationToDeduction deducts stock and logs a sale movement', function (): void {
    ['balance' => $balance, 'product' => $product, 'order' => $order] = makeInventoryFixture();

    $service = app(InventoryService::class);
    $service->reserveForOrder($order);
    $service->convertReservationToDeduction($order);

    // Balance: stock deducted, reservation released
    expect((float) $balance->fresh()->quantity)->toBe(8.0)
        ->and((float) $balance->fresh()->reserved_quantity)->toBe(0.0);

    // Immutable movement log records the sale with a reason
    $this->assertDatabaseHas('inventory_movements', [
        'product_id' => $product->id,
        'type' => 'sale',
        'quantity' => '-2.0000',
        'reason' => "Order {$order->order_number} confirmed",
        'reference_id' => $order->id,
    ]);

    // Reservation is marked fulfilled and soft-deleted
    $reservation = StockReservation::withTrashed()->where('order_id', $order->id)->first();
    expect($reservation->status)->toBe('fulfilled')
        ->and($reservation->deleted_at)->not->toBeNull();
});

test('restoreForOrder releases an outstanding reservation without touching stock', function (): void {
    ['balance' => $balance, 'order' => $order] = makeInventoryFixture();

    $service = app(InventoryService::class);
    $service->reserveForOrder($order);
    $service->restoreForOrder($order);

    // Quantity untouched, reservation released
    expect((float) $balance->fresh()->quantity)->toBe(10.0)
        ->and((float) $balance->fresh()->reserved_quantity)->toBe(0.0);

    $reservation = StockReservation::withTrashed()->where('order_id', $order->id)->first();
    expect($reservation->status)->toBe('cancelled')
        ->and($reservation->deleted_at)->not->toBeNull();
});

test('reserve then deduct then restore returns the balance to its starting point', function (): void {
    ['balance' => $balance, 'product' => $product, 'order' => $order] = makeInventoryFixture();

    $service = app(InventoryService::class);
    $service->reserveForOrder($order);
    $service->convertReservationToDeduction($order);
    $service->restoreForOrder($order);

    // Full round-trip: back to 10 on hand, nothing reserved
    expect((float) $balance->fresh()->quantity)->toBe(10.0)
        ->and((float) $balance->fresh()->reserved_quantity)->toBe(0.0);

    // A return movement documents the restoration
    $this->assertDatabaseHas('inventory_movements', [
        'product_id' => $product->id,
        'type' => 'return',
        'quantity' => '2.0000',
        'reason' => "Order {$order->order_number} cancelled — stock restored",
        'reference_id' => $order->id,
    ]);
});

test('a base-product reservation never touches per-variant balance rows', function (): void {
    ['balance' => $baseBalance, 'product' => $product, 'order' => $order, 'location' => $location] = makeInventoryFixture();

    // A separate balance row for a variant of the same product
    $variant = Variant::factory()->create(['product_id' => $product->id, 'is_active' => true]);
    $variantBalance = InventoryBalance::create([
        'product_id' => $product->id,
        'variant_id' => $variant->id,
        'location_id' => $location->id,
        'quantity' => 5,
        'reserved_quantity' => 0,
    ]);

    app(InventoryService::class)->reserveForOrder($order);

    // Only the base (variant_id IS NULL) row is reserved against
    expect((float) $baseBalance->fresh()->reserved_quantity)->toBe(2.0)
        ->and((float) $variantBalance->fresh()->reserved_quantity)->toBe(0.0);
});

test('findCartShortages reports items that exceed available stock', function (): void {
    ['product' => $product] = makeInventoryFixture(onHand: 3.0);

    $service = app(InventoryService::class);

    // Within stock → no shortages
    expect($service->findCartShortages([
        ['product_id' => $product->id, 'variant_id' => null, 'quantity' => 3],
    ]))->toBe([]);

    // Beyond stock → one clear shortage message naming the product
    $shortages = $service->findCartShortages([
        ['product_id' => $product->id, 'variant_id' => null, 'quantity' => 4],
    ]);

    expect($shortages)->toHaveCount(1)
        ->and($shortages[0])->toContain($product->name);
});

test('findCartShortages skips products without inventory balance rows', function (): void {
    // Tracked product but no balance rows anywhere → treated as not stock-managed
    $product = Product::factory()->create([
        'is_active' => true,
        'track_inventory' => true,
    ]);

    $shortages = app(InventoryService::class)->findCartShortages([
        ['product_id' => $product->id, 'variant_id' => null, 'quantity' => 99],
    ]);

    expect($shortages)->toBe([]);
});
