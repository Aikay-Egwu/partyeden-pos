<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\PlaceOrderRequest;
use App\Jobs\SendOrderConfirmationEmail;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Services\CartService;
use App\Services\DeliveryZoneMatcher;
use App\Services\InventoryService;
use App\Services\LoyaltyService;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Order placement and tracking controller.
 */
class StoreOrderController extends Controller
{
    public function __construct(
        private CartService $cart,
        private DeliveryZoneMatcher $deliveryZoneMatcher,
        private InventoryService $inventory,
        private LoyaltyService $loyalty,
        private OrderService $orders,
    ) {}

    // Place an order from the cart
    public function store(PlaceOrderRequest $request): RedirectResponse
    {
        $cartContents = $this->cart->contents();

        if ($cartContents['count'] === 0) {
            return back()->with('error', 'Your cart is empty.');
        }

        $email = $request->string('email')->toString();
        $firstName = $request->string('first_name')->toString();
        $lastName = $request->string('last_name')->toString();
        $phone = $request->filled('phone') ? $request->string('phone')->toString() : null;
        $notes = $request->filled('notes') ? $request->string('notes')->toString() : null;
        $fulfillmentType = $request->string('fulfillment_type')->toString();
        $requestedLoyaltyPoints = $request->filled('loyalty_points')
            ? (float) $request->input('loyalty_points')
            : 0.0;

        $deliveryZone = null;
        $deliveryPostcode = null;
        $shippingAmount = '0';

        if ($fulfillmentType === 'delivery') {
            $deliveryPostcode = DeliveryZoneMatcher::normalize($request->string('delivery_postcode')->toString());

            if ($deliveryPostcode === null) {
                throw ValidationException::withMessages([
                    'delivery_postcode' => 'Enter a postcode for delivery.',
                ]);
            }

            $deliveryZone = $this->deliveryZoneMatcher->find($deliveryPostcode);

            if (! $deliveryZone instanceof DeliveryZone) {
                throw ValidationException::withMessages([
                    'delivery_postcode' => 'We do not currently deliver to that postcode.',
                ]);
            }

            if ($deliveryZone->min_order_amount !== null && (float) $cartContents['total'] < (float) $deliveryZone->min_order_amount) {
                throw ValidationException::withMessages([
                    'delivery_postcode' => 'This delivery zone requires a higher minimum order value.',
                ]);
            }

            $shippingAmount = (string) $deliveryZone->delivery_price;
        }

        // Reject the order if any cart item exceeds available stock
        $shortages = $this->inventory->findCartShortages($cartContents['items']);

        if ($shortages !== []) {
            return back()->with('error', $shortages[0]);
        }

        $loyaltyAccount = $this->loyalty->accountForEmail($email);
        $loyaltyRedemption = $this->loyalty->redemptionPreview(
            $loyaltyAccount,
            $requestedLoyaltyPoints,
            (float) $cartContents['total'] + (float) $shippingAmount,
        );

        try {
            // Customer + order + items + loyalty, all in one transaction
            $order = $this->orders->createFromCart(
                cartContents: $cartContents,
                customerData: [
                    'email' => $email,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone' => $phone,
                ],
                fulfillmentType: $fulfillmentType,
                deliveryZone: $deliveryZone,
                deliveryPostcode: $deliveryPostcode,
                shippingAmount: $shippingAmount,
                notes: $notes,
                loyaltyAccount: $loyaltyAccount,
                loyaltyRedemption: $loyaltyRedemption,
                shippingAddress: $fulfillmentType === 'delivery' ? [
                    'line1' => $request->string('address_line1')->toString(),
                    'line2' => $request->filled('address_line2') ? $request->string('address_line2')->toString() : null,
                    'city' => $request->string('city')->toString(),
                ] : null,
            );
        } catch (\Throwable) {
            return back()->with('error', 'Could not place order. Please try again.');
        }

        // Reserve inventory for this order (non-blocking — fails silently with a log)
        $this->inventory->reserveForOrder($order);

        // Clear the cart
        $this->cart->clear();

        // Send confirmation email to customer + admin notification (queued)
        SendOrderConfirmationEmail::dispatch($order);

        // Redirect to the signed confirmation URL — the signature is what
        // authorises the guest to view this order's confirmation page
        return redirect()->to(URL::signedRoute('store.orders.confirmation', ['order' => $order->id]))
            ->with('success', 'Order placed successfully!');
    }

    // Order confirmation page
    public function confirmation(Order $order): Response
    {
        return Inertia::render('store/orders/confirmation', [
            'order' => $order->load([
                'customer',
                'deliveryZone',
                'items' => fn ($query) => $query
                    ->whereNull('parent_order_item_id')
                    ->with([
                        'product',
                        'customizationPrimaryColor',
                        'customizationSecondaryColor',
                        'childItems.product',
                    ]),
            ]),
        ]);
    }

    // Order tracking search page
    public function track(Request $request): Response
    {
        $foundOrder = null;

        if ($request->filled('order_number') && $request->filled('email')) {
            $orderNumber = $request->string('order_number')->toString();
            $email = $request->string('email')->toString();

            $foundOrder = Order::where('order_number', $orderNumber)
                ->whereHas('customer', fn ($q) => $q->where('email', $email))
                ->with(['items.product', 'customer', 'shipments'])
                ->first();
        }

        return Inertia::render('store/orders/track', [
            'searchedOrder' => $foundOrder,
            'filters' => $request->only(['order_number', 'email']),
        ]);
    }
}
