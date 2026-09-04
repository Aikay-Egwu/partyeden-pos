<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\DeliveryZoneMatcher;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Checkout page controller.
 * Displays cart summary and customer info form before placing order.
 */
class StoreCheckoutController extends Controller
{
    public function __construct(
        private CartService $cart,
        private DeliveryZoneMatcher $deliveryZoneMatcher,
        private LoyaltyService $loyalty,
    ) {}

    public function index(): Response|RedirectResponse
    {
        $cartContents = $this->cart->contents();

        // Redirect to cart if nothing in it
        if ($cartContents['count'] === 0) {
            return redirect()->route('store.cart');
        }

        // Get authenticated customer for pre-fill
        $customer = null;
        if (Auth::check() && Auth::user()->customer) {
            $customer = Auth::user()->customer;
        }

        return Inertia::render('store/checkout/index', [
            'cart' => $cartContents,
            'customer' => $customer ? [
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
            ] : null,
            'loyaltySettings' => $this->loyalty->settings(),
        ]);
    }

    public function lookupDeliveryZone(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'postcode' => ['required', 'string', 'max:20'],
        ]);

        $normalizedPostcode = DeliveryZoneMatcher::normalize($validated['postcode']);

        if ($normalizedPostcode === null) {
            return response()->json([
                'zone' => null,
                'message' => 'Enter a postcode for delivery.',
            ], 422);
        }

        $zone = $this->deliveryZoneMatcher->find($normalizedPostcode);

        if ($zone === null) {
            return response()->json([
                'zone' => null,
                'message' => 'Outside delivery zone.',
            ]);
        }

        return response()->json([
            'zone' => [
                'id' => $zone->id,
                'name' => $zone->name,
                'delivery_price' => (string) $zone->delivery_price,
                'min_order_amount' => $zone->min_order_amount !== null
                    ? (string) $zone->min_order_amount
                    : null,
            ],
            'message' => null,
        ]);
    }

    public function lookupLoyalty(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $account = $this->loyalty->accountForEmail($validated['email']);
        $settings = $this->loyalty->settings();

        // Never expose customer identity here: this endpoint is unauthenticated,
        // so returning names would allow PII harvesting by email enumeration.
        return response()->json([
            'account' => $account ? [
                'id' => $account->id,
                'points_balance' => (string) $account->points_balance,
                'total_points_earned' => (string) $account->total_points_earned,
                'total_points_redeemed' => (string) $account->total_points_redeemed,
            ] : null,
            'settings' => [
                'points_per_currency_unit' => (string) $settings->points_per_currency_unit,
                'currency_value_per_point' => (string) $settings->currency_value_per_point,
                'is_active' => $settings->is_active,
            ],
        ]);
    }
}
