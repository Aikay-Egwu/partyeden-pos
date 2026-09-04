<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\InventoryBalance;
use App\Models\InventoryMovement;
use App\Models\KitMapping;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockReservation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Handles stock deduction, reservation, and restoration for online orders.
 *
 * Flow:
 *  1. On order placement   → reserveForOrder()     (creates StockReservation rows)
 *  2. On order confirmed   → convertReservationToDeduction()  (converts to InventoryMovement)
 *  3. On order cancelled   → restoreForOrder()      (reverses reservation / movement)
 *
 * Kit products: component stock is deducted individually per KitMapping.
 *
 * All mutations run inside a database transaction and lock the affected
 * inventory_balances rows (lockForUpdate) so concurrent checkouts cannot
 * oversell stock or corrupt balances.
 */
class InventoryService
{
    /**
     * Resolve the warehouse location to use for stock operations.
     * Prefers the order's assigned location; falls back to the first active location.
     */
    private function resolveLocationId(Order $order): ?string
    {
        if ($order->location_id) {
            return (string) $order->location_id;
        }

        $location = Location::where('is_active', true)->first();

        return $location?->id;
    }

    /**
     * Check cart contents against available stock (quantity − reserved_quantity,
     * summed across locations) before an order is created.
     *
     * Returns human-readable shortage messages; an empty array means every
     * item can be fulfilled. Products without any inventory balance rows are
     * treated as not yet stock-managed and skipped — this mirrors the
     * reservation behaviour, which is a no-op when no balance row exists.
     *
     * @param  array<int, array<string, mixed>>  $cartItems  Items from CartService::contents()
     * @return array<int, string>
     */
    public function findCartShortages(array $cartItems): array
    {
        // Aggregate required quantities per (product, variant), exploding
        // kits into their tracked components and including add-ons.
        $required = [];

        $addRequirement = function (Product $product, ?string $variantId, float $qty) use (&$required): void {
            if (! $product->track_inventory) {
                return;
            }

            $key = $product->id.'|'.($variantId ?? 'base');

            if (! isset($required[$key])) {
                $required[$key] = [
                    'product_id' => $product->id,
                    'variant_id' => $variantId,
                    'name' => $product->name,
                    'qty' => 0.0,
                ];
            }

            $required[$key]['qty'] += $qty;
        };

        foreach ($cartItems as $item) {
            $product = Product::with('kitMappings.component')->find((string) $item['product_id']);
            $qty = (float) ($item['quantity'] ?? 0);

            if ($product instanceof Product && $qty > 0) {
                if ($product->product_type === 'kit') {
                    /** @var KitMapping $mapping */
                    foreach ($product->kitMappings as $mapping) {
                        /** @var Product|null $component */
                        $component = $mapping->component;

                        if ($component instanceof Product) {
                            $addRequirement($component, $mapping->variant_id, $qty * (float) $mapping->quantity);
                        }
                    }
                } else {
                    $addRequirement($product, $item['variant_id'] ?? null, $qty);
                }
            }

            foreach ($item['add_ons'] ?? [] as $addOn) {
                $addOnProduct = Product::find((string) $addOn['id']);

                if ($addOnProduct instanceof Product) {
                    $addRequirement($addOnProduct, null, (float) $addOn['quantity']);
                }
            }
        }

        $shortages = [];

        foreach ($required as $requirement) {
            $balances = InventoryBalance::query()
                ->where('product_id', $requirement['product_id'])
                ->where('variant_id', $requirement['variant_id'])
                ->get();

            // No balance rows → product is not stock-managed yet; skip.
            if ($balances->isEmpty()) {
                continue;
            }

            $available = 0.0;
            foreach ($balances as $balance) {
                $available += (float) $balance->quantity - (float) $balance->reserved_quantity;
            }

            if ($available < $requirement['qty']) {
                $shortages[] = sprintf(
                    'Not enough stock for "%s" — only %s available.',
                    $requirement['name'],
                    rtrim(rtrim(number_format(max($available, 0), 4, '.', ''), '0'), '.'),
                );
            }
        }

        return $shortages;
    }

    /**
     * Create StockReservation rows for all trackable items in an order.
     * Called immediately after order placement so stock cannot be double-sold.
     */
    public function reserveForOrder(Order $order): void
    {
        $locationId = $this->resolveLocationId($order);

        if (! $locationId) {
            Log::warning('InventoryService: no location found for reservation', ['order_id' => $order->id]);

            return;
        }

        $order->loadMissing(['items.product', 'items.product.kitMappings.component']);

        DB::transaction(function () use ($order, $locationId): void {
            /** @var OrderItem $item */
            foreach ($order->items as $item) {
                // Skip child (add-on) items — they have their own reservation
                if ($item->parent_order_item_id) {
                    continue;
                }

                $this->reserveItem($item, $order, $locationId);
            }
        });
    }

    /**
     * Reserve stock for a single order item.
     * For kit products, reserve each component's stock individually.
     */
    private function reserveItem(OrderItem $item, Order $order, string $locationId): void
    {
        /** @var Product|null $product */
        $product = $item->product;

        if (! $product || ! $product->track_inventory) {
            return;
        }

        $qty = (float) $item->quantity;

        if ($product->product_type === 'kit') {
            // Reserve each kit component's stock
            /** @var KitMapping $mapping */
            foreach ($product->kitMappings as $mapping) {
                /** @var Product|null $component */
                $component = $mapping->component;
                if ($component && $component->track_inventory) {
                    $componentQty = $qty * (float) $mapping->quantity;
                    $this->createReservation($order, $component->id, $mapping->variant_id, $locationId, $componentQty);
                }
            }
        } else {
            $this->createReservation($order, $product->id, $item->variant_id, $locationId, $qty);
        }
    }

    /**
     * Create a single StockReservation row and bump reserved_quantity on InventoryBalance.
     */
    private function createReservation(
        Order $order,
        string $productId,
        ?string $variantId,
        string $locationId,
        float $qty
    ): void {
        StockReservation::create([
            'order_id' => $order->id,
            'product_id' => $productId,
            'variant_id' => $variantId,
            'location_id' => $locationId,
            'quantity' => $qty,
            'expires_at' => now()->addHours(48),
        ]);

        // Lock the exact matching balance row and bump reserved_quantity
        $balance = $this->lockedBalance($productId, $variantId, $locationId);

        if ($balance) {
            $balance->reserved_quantity = (float) $balance->reserved_quantity + $qty;
            $balance->save();
        }
    }

    /**
     * Convert StockReservation rows into InventoryMovement records (actual deductions).
     * Called when admin confirms an order.
     */
    public function convertReservationToDeduction(Order $order): void
    {
        $locationId = $this->resolveLocationId($order);

        DB::transaction(function () use ($order, $locationId): void {
            $reservations = StockReservation::where('order_id', $order->id)
                ->lockForUpdate()
                ->get();

            foreach ($reservations as $reservation) {
                $reservationLocationId = $reservation->location_id ?? $locationId;
                $qty = abs((float) $reservation->quantity);

                // Create a sale-type inventory movement (negative quantity = stock out)
                InventoryMovement::create([
                    'product_id' => $reservation->product_id,
                    'variant_id' => $reservation->variant_id,
                    'location_id' => $reservationLocationId,
                    'quantity' => -$qty,
                    'type' => 'sale',
                    'reason' => "Order {$order->order_number} confirmed",
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                ]);

                // Deduct from actual balance and free the reservation
                $balance = $this->lockedBalance($reservation->product_id, $reservation->variant_id, $reservationLocationId);

                if ($balance) {
                    $balance->quantity = (float) $balance->quantity - $qty;
                    $balance->reserved_quantity = (float) $balance->reserved_quantity - $qty;
                    $balance->save();
                }

                // Mark fulfilled, then soft-delete the reservation
                $reservation->update(['status' => 'fulfilled']);
                $reservation->delete();
            }
        });
    }

    /**
     * Reverse all inventory operations for a cancelled order.
     * Removes outstanding reservations and (if already deducted) creates a return movement.
     */
    public function restoreForOrder(Order $order): void
    {
        $locationId = $this->resolveLocationId($order);

        DB::transaction(function () use ($order, $locationId): void {
            // Release any outstanding reservations
            $reservations = StockReservation::where('order_id', $order->id)
                ->lockForUpdate()
                ->get();

            foreach ($reservations as $reservation) {
                $qty = abs((float) $reservation->quantity);
                $balance = $this->lockedBalance($reservation->product_id, $reservation->variant_id, $reservation->location_id ?? $locationId);

                if ($balance) {
                    $balance->reserved_quantity = (float) $balance->reserved_quantity - $qty;
                    $balance->save();
                }

                $reservation->update(['status' => 'cancelled']);
                $reservation->delete();
            }

            // Reverse any already-committed movements for this order
            $committed = InventoryMovement::where('reference_type', Order::class)
                ->where('reference_id', $order->id)
                ->where('type', 'sale')
                ->get();

            foreach ($committed as $movement) {
                $qty = abs((float) $movement->quantity);

                InventoryMovement::create([
                    'product_id' => $movement->product_id,
                    'variant_id' => $movement->variant_id,
                    'location_id' => $movement->location_id,
                    'quantity' => $qty,
                    'type' => 'return',
                    'reason' => "Order {$order->order_number} cancelled — stock restored",
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                ]);

                $balance = $this->lockedBalance($movement->product_id, $movement->variant_id, (string) $movement->location_id);

                if ($balance) {
                    $balance->quantity = (float) $balance->quantity + $qty;
                    $balance->save();
                }

                $movement->delete();
            }
        });
    }

    /**
     * Fetch the balance row for an exact (product, variant, location) match
     * with a row-level lock so concurrent updates queue instead of racing.
     *
     * A null variant matches only the base-product row (variant_id IS NULL),
     * never the per-variant rows.
     */
    private function lockedBalance(string $productId, ?string $variantId, string $locationId): ?InventoryBalance
    {
        return InventoryBalance::query()
            ->where('product_id', $productId)
            ->where('location_id', $locationId)
            ->where('variant_id', $variantId)
            ->lockForUpdate()
            ->first();
    }
}
