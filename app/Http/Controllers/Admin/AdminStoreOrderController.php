<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderRequest;
use App\Jobs\SendStoreOrderPaymentLinkEmail;
use App\Models\Color;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Variant;
use App\Services\StoreOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for creating and managing phone and WhatsApp store orders in the admin panel.
 */
class AdminStoreOrderController extends Controller
{
    public function __construct(
        private StoreOrderService $storeOrderService,
    ) {}

    /**
     * Display the store order creation form.
     */
    public function create(): Response
    {
        $availableColors = Color::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'hex_code']);

        $deliveryZones = DeliveryZone::where('is_active', true)
            ->with(['prefixes' => fn ($query) => $query->where('is_active', true)])
            ->get();

        return Inertia::render('admin/store-orders/create', [
            'availableColors' => $availableColors,
            'deliveryZones' => $deliveryZones,
            'checkoutTimezone' => config('checkout.timezone', 'Europe/London'),
        ]);
    }

    /**
     * Search products by name, SKU, or variant details.
     */
    public function searchProducts(Request $request): JsonResponse
    {
        $query = $request->string('query')->trim()->toString();

        $products = Product::query()
            ->where('is_active', true)
            ->when($query !== '', function ($builder) use ($query): void {
                $builder->where(function ($sub) use ($query): void {
                    $sub->where('name', 'like', "%{$query}%")
                        ->orWhere('sku', 'like', "%{$query}%")
                        ->orWhereHas('variants', function ($vSub) use ($query): void {
                            $vSub->where('sku', 'like', "%{$query}%")
                                ->orWhere('name', 'like', "%{$query}%");
                        });
                });
            })
            ->with([
                'variants' => fn ($q) => $q->where('is_active', true),
                'mainColors.color',
                'secondaryColors.color',
                'defaultImages',
            ])
            ->limit(20)
            ->get()
            ->map(function (Product $product): array {
                $firstImage = $product->defaultImages->first();
                $imageUrl = $firstImage instanceof ProductImage ? $firstImage->url : null;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'selling_price' => (float) $product->selling_price,
                    'customise_text' => (bool) $product->customise_text,
                    'customise_color' => (bool) $product->customise_color,
                    'preorder' => (bool) $product->preorder,
                    'image_url' => $imageUrl,
                    'variants' => $product->variants->map(fn (Variant $v): array => [
                        'id' => $v->id,
                        'name' => $v->name ?? $v->sku,
                        'sku' => $v->sku,
                        'price_adjustment' => (float) $v->price_adjustment,
                        'price' => (float) $product->selling_price + (float) $v->price_adjustment,
                    ])->values(),
                    'main_colors' => $product->mainColors->map(fn ($mc): array => [
                        'id' => $mc->color?->id,
                        'name' => $mc->color?->name,
                        'hex_code' => $mc->color?->hex_code,
                    ])->filter(fn ($c): bool => $c['id'] !== null)->values(),
                    'secondary_colors' => $product->secondaryColors->map(fn ($sc): array => [
                        'id' => $sc->color?->id,
                        'name' => $sc->color?->name,
                        'hex_code' => $sc->color?->hex_code,
                    ])->filter(fn ($c): bool => $c['id'] !== null)->values(),
                ];
            });

        return response()->json($products);
    }

    /**
     * Store a newly created order and generate its Stripe Payment Link.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        /** @var array<string, mixed> $validated */
        $validated = $request->validated();

        $adminUserId = $request->user()?->id;

        /** @var Order $order */
        $order = $this->storeOrderService->createStoreOrder($validated, $adminUserId);

        // Send payment link via email if requested
        $sendLinkVia = $request->string('send_link_via')->toString();
        if ($sendLinkVia === 'email' && $order->customer?->email && $order->stripe_payment_link_url) {
            SendStoreOrderPaymentLinkEmail::dispatch($order);
        }

        return redirect()->route('orders.show', $order)->with([
            'success' => "Store Order #{$order->order_number} created successfully.",
            'payment_link_url' => $order->stripe_payment_link_url,
        ]);
    }

    /**
     * Resend or copy the Stripe Payment Link for an existing order.
     */
    public function resendPaymentLink(Order $order, Request $request): RedirectResponse
    {
        if ($order->payment_status === 'paid') {
            return back()->with('error', 'This order is already marked as paid.');
        }

        // Generate link if not already created
        if (! $order->stripe_payment_link_url) {
            $this->storeOrderService->generatePaymentLinkForOrder($order);
            $order->refresh();
        }

        if (! $order->stripe_payment_link_url) {
            return back()->with('error', 'Could not generate Stripe payment link. Check Stripe configuration.');
        }

        if ($request->boolean('send_email')) {
            if (! $order->customer?->email) {
                return back()->with('error', 'Customer does not have an email address to send the link to.');
            }

            SendStoreOrderPaymentLinkEmail::dispatch($order);

            return back()->with([
                'success' => "Payment link sent to {$order->customer->email}.",
                'payment_link_url' => $order->stripe_payment_link_url,
            ]);
        }

        return back()->with([
            'success' => 'Payment link is ready.',
            'payment_link_url' => $order->stripe_payment_link_url,
        ]);
    }
}
