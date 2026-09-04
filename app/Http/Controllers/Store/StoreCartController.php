<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Storefront cart controller.
 * Session-based cart with add/update/remove actions + full cart page.
 */
class StoreCartController extends Controller
{
    public function __construct(
        private CartService $cart,
    ) {}

    // Full cart page
    public function index(): Response
    {
        return Inertia::render('store/cart/index', [
            'cart' => $this->cart->contents(),
        ]);
    }

    // Add item to cart (JSON response for card buttons)
    public function add(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'variant_id' => 'nullable|uuid',
            'quantity' => 'integer|min:1',
            // Optional customization fields for the balloon shop
            'customization_text' => 'nullable|string|max:500',
            'customization_font' => 'nullable|string|max:100',
            'customization_primary_color_id' => 'nullable|integer|exists:colors,id',
            'customization_secondary_color_id' => 'nullable|integer|exists:colors,id',
            'add_on_ids' => 'nullable|array',
            'add_on_ids.*' => 'uuid|exists:products,id',
        ]);

        $product = Product::query()
            ->with(['variants', 'mainColors', 'secondaryColors', 'addOns'])
            ->findOrFail($validated['product_id']);

        $this->validateCartSelections($product, $validated);

        $this->cart->add(
            $product->id,
            $validated['variant_id'] ?? null,
            $request->integer('quantity', 1),
            $request->only([
                'customization_text', 'customization_font',
                'customization_primary_color_id', 'customization_secondary_color_id', 'add_on_ids',
            ]),
        );

        return back()->with('success', 'Item added to cart.');
    }

    // Update item quantity (JSON response for cart page)
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'line_key' => 'nullable|string',
            'product_id' => 'nullable|uuid',
            'variant_id' => 'nullable|uuid',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($request->filled('line_key')) {
            $this->cart->updateByKey($request->string('line_key')->toString(), $request->integer('quantity'));
        } else {
            $request->validate([
                'product_id' => 'required|uuid',
            ]);

            $this->cart->update(
                $request->string('product_id')->toString(),
                $request->filled('variant_id') ? $request->string('variant_id')->toString() : null,
                $request->integer('quantity'),
            );
        }

        return back();
    }

    // Remove item from cart
    public function remove(Request $request): RedirectResponse
    {
        $request->validate([
            'line_key' => 'nullable|string',
            'product_id' => 'nullable|uuid',
            'variant_id' => 'nullable|uuid',
        ]);

        if ($request->filled('line_key')) {
            $this->cart->removeByKey($request->string('line_key')->toString());
        } else {
            $request->validate([
                'product_id' => 'required|uuid',
            ]);

            $this->cart->remove(
                $request->string('product_id')->toString(),
                $request->filled('variant_id') ? $request->string('variant_id')->toString() : null,
            );
        }

        return back();
    }

    private function validateCartSelections(Product $product, array $validated): void
    {
        if (! empty($validated['variant_id'])) {
            $variantIsValid = $product->variants()
                ->whereKey($validated['variant_id'])
                ->where('is_active', true)
                ->exists();

            if (! $variantIsValid) {
                throw ValidationException::withMessages([
                    'variant_id' => 'Select an active variant that belongs to this product.',
                ]);
            }
        }

        if (! empty($validated['customization_primary_color_id'])) {
            $primaryColorAllowed = $product->mainColors()
                ->where('color_id', $validated['customization_primary_color_id'])
                ->exists();

            if (! $primaryColorAllowed) {
                throw ValidationException::withMessages([
                    'customization_primary_color_id' => 'Select a valid primary color for this product.',
                ]);
            }
        }

        if (! empty($validated['customization_secondary_color_id'])) {
            $secondaryColorAllowed = $product->secondaryColors()
                ->where('color_id', $validated['customization_secondary_color_id'])
                ->exists();

            if (! $secondaryColorAllowed) {
                throw ValidationException::withMessages([
                    'customization_secondary_color_id' => 'Select a valid secondary color for this product.',
                ]);
            }
        }

        $requestedAddOns = $validated['add_on_ids'] ?? [];

        if ($requestedAddOns !== []) {
            $allowedAddOns = $product->addOns()
                ->wherePivot('is_active', true)
                ->pluck('products.id')
                ->all();

            foreach ($requestedAddOns as $addOnId) {
                if (! in_array($addOnId, $allowedAddOns, true)) {
                    throw ValidationException::withMessages([
                        'add_on_ids' => 'Select only active add-ons configured for this product.',
                    ]);
                }
            }
        }
    }
}
