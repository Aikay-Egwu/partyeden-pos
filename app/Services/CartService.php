<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Color;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Session\SessionManager;

/**
 * Session-based shopping cart for the storefront.
 *
 * Cart is stored as an array in the session under 'cart'.
 * Each item is keyed by "product_id-variant_id" for uniqueness.
 * Handles add, update quantity, remove, and total calculation.
 */
class CartService
{
    public function __construct(
        private SessionManager $session,
    ) {}

    /**
     * Get the full cart contents with product details from the database.
     */
    public function contents(): array
    {
        $cart = $this->session->get('cart', []);
        $items = [];
        $total = '0';

        foreach ($cart as $key => $item) {
            $product = Product::find($item['product_id']);
            if (! $product || ! $product->is_active) {
                continue; // Product no longer available, skip
            }

            $variant = $item['variant_id']
                ? Variant::find($item['variant_id'])
                : null;

            $price = $variant
                ? (string) ((float) $product->selling_price + (float) $variant->price_adjustment)
                : $product->selling_price;

            $productLineTotal = (string) ((float) $price * $item['quantity']);
            $selectedAddOnIds = $this->normalizedAddOnIds($item['add_on_ids'] ?? []);
            $resolvedAddOns = $this->resolveAddOns($selectedAddOnIds, $item['quantity']);
            $addOnTotal = (string) array_reduce(
                $resolvedAddOns,
                fn (float $carry, array $addOn): float => $carry + (float) $addOn['line_total'],
                0.0,
            );
            $lineTotal = (string) ((float) $productLineTotal + (float) $addOnTotal);
            $primaryColor = $this->resolveColor($item['customization_primary_color_id'] ?? null);
            $secondaryColor = $this->resolveColor($item['customization_secondary_color_id'] ?? null);
            $primaryImage = $product->images()->where('is_primary', true)->first();
            $kitMappings = $product->product_type === 'kit'
                ? $product->kitMappings()->with(['component', 'variant'])->get()
                : collect();

            $items[] = [
                'line_key' => $key,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'],
                'name' => $product->name,
                'variant_name' => $variant?->name,
                'price' => $price,
                'quantity' => $item['quantity'],
                'product_line_total' => $productLineTotal,
                'add_on_total' => $addOnTotal,
                'line_total' => $lineTotal,
                'image' => $primaryImage?->url,
                'product_type' => $product->product_type,
                'preorder' => $product->preorder,
                // Customization fields from add-to-cart
                'customization_text' => $item['customization_text'] ?? null,
                'customization_font' => $item['customization_font'] ?? null,
                'customization_primary_color_id' => $item['customization_primary_color_id'] ?? null,
                'customization_secondary_color_id' => $item['customization_secondary_color_id'] ?? null,
                'customization_primary_color' => $primaryColor,
                'customization_secondary_color' => $secondaryColor,
                'is_customized' => $this->hasCustomization($item, $resolvedAddOns),
                'add_ons' => $resolvedAddOns,
                'kit_components' => $kitMappings->map(fn ($mapping) => [
                    'id' => $mapping->id,
                    'quantity' => $mapping->quantity,
                    'component_name' => $mapping->component?->name,
                    'variant_name' => $mapping->variant?->name,
                ])->values()->all(),
            ];

            $total = (string) ((float) $total + (float) $lineTotal);
        }

        return [
            'items' => $items,
            'count' => array_sum(array_column($items, 'quantity')),
            'total' => $total,
        ];
    }

    /**
     * Cart summary (count + total only, no DB hits).
     */
    public function summary(): array
    {
        $contents = $this->contents();

        return [
            'count' => $contents['count'],
            'total' => $contents['total'],
        ];
    }

    /**
     * Add a product/variant to the cart or increment quantity.
     * Accepts optional customization fields for the balloon shop.
     */
    public function add(string $productId, ?string $variantId, int $quantity = 1, array $customization = []): void
    {
        $cart = $this->session->get('cart', []);
        $key = $this->itemKey($productId, $variantId, $customization);

        if (isset($cart[$key])) {
            $cart[$key]['quantity'] += $quantity;
        } else {
            $cart[$key] = [
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'add_on_ids' => $this->normalizedAddOnIds($customization['add_on_ids'] ?? []),
            ];
        }

        // Store customization fields if provided (text, font, colors)
        if (! empty($customization)) {
            $cart[$key]['customization_text'] = $customization['customization_text'] ?? null;
            $cart[$key]['customization_font'] = $customization['customization_font'] ?? null;
            $cart[$key]['customization_primary_color_id'] = $customization['customization_primary_color_id'] ?? null;
            $cart[$key]['customization_secondary_color_id'] = $customization['customization_secondary_color_id'] ?? null;
            $cart[$key]['add_on_ids'] = $this->normalizedAddOnIds($customization['add_on_ids'] ?? []);
        }

        $this->session->put('cart', $cart);
    }

    /**
     * Update the quantity of a cart item.
     */
    public function update(string $productId, ?string $variantId, int $quantity): void
    {
        $key = $this->itemKey($productId, $variantId);
        $cart = $this->session->get('cart', []);

        if (isset($cart[$key])) {
            if ($quantity <= 0) {
                unset($cart[$key]);
            } else {
                $cart[$key]['quantity'] = $quantity;
            }
        }

        $this->session->put('cart', $cart);
    }

    public function updateByKey(string $lineKey, int $quantity): void
    {
        $cart = $this->session->get('cart', []);

        if (! isset($cart[$lineKey])) {
            return;
        }

        if ($quantity <= 0) {
            unset($cart[$lineKey]);
        } else {
            $cart[$lineKey]['quantity'] = $quantity;
        }

        $this->session->put('cart', $cart);
    }

    /**
     * Remove an item from the cart.
     */
    public function remove(string $productId, ?string $variantId): void
    {
        $key = $this->itemKey($productId, $variantId);
        $cart = $this->session->get('cart', []);

        unset($cart[$key]);

        $this->session->put('cart', $cart);
    }

    public function removeByKey(string $lineKey): void
    {
        $cart = $this->session->get('cart', []);

        unset($cart[$lineKey]);

        $this->session->put('cart', $cart);
    }

    /**
     * Clear the entire cart.
     */
    public function clear(): void
    {
        $this->session->forget('cart');
    }

    /**
     * Generate a unique key for a cart item.
     */
    private function itemKey(string $productId, ?string $variantId, array $options = []): string
    {
        if ($options === []) {
            return $productId.'-'.($variantId ?? 'base');
        }

        $fingerprint = [
            'product_id' => $productId,
            'variant_id' => $variantId,
            'customization_text' => trim((string) ($options['customization_text'] ?? '')),
            'customization_font' => trim((string) ($options['customization_font'] ?? '')),
            'customization_primary_color_id' => $options['customization_primary_color_id'] ?? null,
            'customization_secondary_color_id' => $options['customization_secondary_color_id'] ?? null,
            'add_on_ids' => $this->normalizedAddOnIds($options['add_on_ids'] ?? []),
        ];

        return md5(json_encode($fingerprint, JSON_THROW_ON_ERROR));
    }

    private function normalizedAddOnIds(array $addOnIds): array
    {
        $normalized = array_values(array_unique(array_filter(
            array_map(static fn ($id) => is_string($id) ? trim($id) : null, $addOnIds),
        )));

        sort($normalized);

        return $normalized;
    }

    private function resolveColor(int|string|null $colorId): ?array
    {
        if ($colorId === null || $colorId === '') {
            return null;
        }

        $color = Color::query()->find((int) $colorId);

        if ($color === null) {
            return null;
        }

        return [
            'id' => $color->id,
            'name' => $color->name,
            'hex_code' => $color->hex_code,
        ];
    }

    private function resolveAddOns(array $addOnIds, int $quantity): array
    {
        if ($addOnIds === []) {
            return [];
        }

        return Product::query()
            ->whereIn('id', $addOnIds)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function (Product $product) use ($quantity): array {
                $lineTotal = (string) ((float) $product->selling_price * $quantity);
                $primaryImage = $product->images()->where('is_primary', true)->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->selling_price,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'image' => $primaryImage?->url,
                ];
            })
            ->values()
            ->all();
    }

    private function hasCustomization(array $item, array $resolvedAddOns): bool
    {
        return ! empty($item['customization_text'])
            || ! empty($item['customization_font'])
            || ! empty($item['customization_primary_color_id'])
            || ! empty($item['customization_secondary_color_id'])
            || $resolvedAddOns !== [];
    }
}
