<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\CapturePaymentOrderRequest;
use App\Http\Requests\Store\CreatePaymentOrderRequest;
use App\Jobs\SendOrderConfirmationEmail;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Services\CartService;
use App\Services\DeliveryZoneMatcher;
use App\Services\InventoryService;
use App\Services\LoyaltyService;
use App\Services\OrderScheduleService;
use App\Services\OrderService;
use App\Services\PaypalService;
use App\Services\StripeService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

/**
 * PayPal + Stripe payment lifecycle controller.
 *
 * Handles the PayPal (Smart Button) and Stripe (PaymentIntents / Elements)
 * checkout flows: remote order creation, server-side capture/confirm with
 * amount+stock+delivery validation, local Order creation via OrderService,
 * and webhook processing for asynchronous payment events.
 */
final class StorePaymentController extends Controller
{
    public function __construct(
        private CartService $cart,
        private PaypalService $paypal,
        private StripeService $stripe,
        private DeliveryZoneMatcher $deliveryZoneMatcher,
        private InventoryService $inventory,
        private LoyaltyService $loyalty,
        private OrderService $orders,
        private OrderScheduleService $schedule,
    ) {}

    /**
     * Create a PayPal order for the current cart contents.
     *
     * Returns the PayPal order ID and approval URL so the frontend
     * can render the PayPal Smart Buttons. Does NOT create a local
     * Order record yet — that happens after successful capture.
     */
    public function createOrder(CreatePaymentOrderRequest $request): JsonResponse
    {
        $cartContents = $this->cart->contents();

        if ($cartContents['count'] === 0) {
            return response()->json([
                'error' => 'Your cart is empty.',
            ], 422);
        }

        $fulfillmentType = $request->string('fulfillment_type')->toString();
        $validated = $request->validate([
            'expected_at' => ['required', 'date_format:Y-m-d\TH:i'],
        ]);
        $this->schedule->validateExpectedAt(
            (string) $validated['expected_at'],
            $cartContents,
            $fulfillmentType,
        );

        $deliveryDetails = $this->resolveDeliveryDetails(
            $fulfillmentType,
            $request->input('delivery_postcode'),
            (float) $cartContents['total'],
        );

        if ($deliveryDetails['error'] !== null) {
            return response()->json([
                'error' => $deliveryDetails['error'],
            ], 422);
        }

        // Calculate total with delivery for the PayPal order amount
        $shippingAmount = $deliveryDetails['shipping_amount'];
        $loyaltyAccount = $this->loyalty->accountForEmail($request->input('email'));
        $loyaltyRedemption = $this->loyalty->redemptionPreview(
            $loyaltyAccount,
            (float) $request->input('loyalty_points', 0),
            (float) $cartContents['total'] + $shippingAmount,
        );

        $totalAmount = max(
            ((float) $cartContents['total'] + $shippingAmount) - $loyaltyRedemption['amount'],
            0,
        );

        if ($totalAmount <= 0) {
            return response()->json([
                'error' => 'Order total must be greater than zero.',
            ], 422);
        }

        $paypalOrder = $this->paypal->createOrder(
            amount: $totalAmount,
            metadata: [
                'description' => 'Party Eden Order',
            ],
        );

        // Extract the approval URL for the frontend
        $approvalUrl = null;
        foreach (($paypalOrder['links'] ?? []) as $link) {
            if (($link['rel'] ?? '') === 'approve') {
                $approvalUrl = $link['href'];
                break;
            }
        }

        if ($paypalOrder['status'] === 'PAYER_ACTION_REQUIRED') {
            Log::info('PayPal instructed payer action required — possible INSTRUMENT_DECLINED. Falling back to approval URL.', [
                'paypal_order_id' => $paypalOrder['id'],
            ]);
        }

        return response()->json([
            'paypalOrderId' => $paypalOrder['id'],
            'approvalUrl' => $approvalUrl,
            'status' => $paypalOrder['status'] ?? 'CREATED',
            'loyaltyDiscount' => $loyaltyRedemption['amount'],
            'loyaltyPoints' => $loyaltyRedemption['points'],
        ]);
    }

    /**
     * Capture a PayPal order and create the local Order record.
     *
     * Called by the frontend after the customer approves payment in the
     * PayPal popup. Captures the payment server-side, then creates the
     * Order, customer, and order items in a single database transaction.
     */
    public function captureOrder(CapturePaymentOrderRequest $request): JsonResponse
    {
        $paypalOrderId = $request->string('paypalOrderId')->toString();

        $cartContents = $this->cart->contents();

        if ($cartContents['count'] === 0) {
            return response()->json([
                'success' => false,
                'error' => 'Your cart is empty.',
            ], 422);
        }

        // 1. Validate delivery before charging the customer
        $email = $request->string('email')->toString();
        $firstName = $request->string('first_name')->toString();
        $lastName = $request->string('last_name')->toString();
        $phone = $request->filled('phone') ? $request->string('phone')->toString() : null;
        $notes = $request->filled('notes') ? $request->string('notes')->toString() : null;
        $fulfillmentType = $request->string('fulfillment_type')->toString();
        $expectedAt = $this->schedule->validateExpectedAt(
            $request->string('expected_at')->toString(),
            $cartContents,
            $fulfillmentType,
        );
        $requestedLoyaltyPoints = $request->filled('loyalty_points')
            ? (float) $request->input('loyalty_points')
            : 0.0;

        $deliveryDetails = $this->resolveDeliveryDetails(
            $fulfillmentType,
            $request->input('delivery_postcode'),
            (float) $cartContents['total'],
        );

        if ($deliveryDetails['error'] !== null) {
            return response()->json([
                'success' => false,
                'error' => $deliveryDetails['error'],
            ], 422);
        }

        $deliveryZone = $deliveryDetails['zone'];
        $deliveryPostcode = $deliveryDetails['postcode'];
        $shippingAmount = (string) $deliveryDetails['shipping_amount'];

        // 2. Idempotency guard: a PayPal order may only ever produce one local order
        if (Order::withTrashed()->where('paypal_order_id', $paypalOrderId)->exists()) {
            Log::warning('PayPal capture rejected: order already exists for this PayPal order ID', [
                'paypal_order_id' => $paypalOrderId,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'This payment has already been processed.',
            ], 409);
        }

        // 3. Reject before charging if any cart item exceeds available stock
        $shortages = $this->inventory->findCartShortages($cartContents['items']);

        if ($shortages !== []) {
            return response()->json([
                'success' => false,
                'error' => $shortages[0],
            ], 422);
        }

        // 4. Recompute the expected total server-side and verify it matches the
        // amount authorised on the PayPal order BEFORE capturing. This prevents
        // amount tampering (e.g. enlarging the cart after createOrder).
        $loyaltyAccount = $this->loyalty->accountForEmail($email);
        $loyaltyRedemption = $this->loyalty->redemptionPreview(
            $loyaltyAccount,
            $requestedLoyaltyPoints,
            (float) $cartContents['total'] + (float) $shippingAmount,
        );

        $expectedTotal = max(
            ((float) $cartContents['total'] + (float) $shippingAmount) - $loyaltyRedemption['amount'],
            0,
        );

        try {
            $paypalOrder = $this->paypal->getOrder($paypalOrderId);
        } catch (\RuntimeException $e) {
            Log::error('PayPal order lookup failed before capture', [
                'paypal_order_id' => $paypalOrderId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment could not be processed. Please try again.',
            ], 402);
        }

        $paypalAmount = $paypalOrder['purchase_units'][0]['amount']['value'] ?? null;

        if (! is_string($paypalAmount) || $paypalAmount !== number_format($expectedTotal, 2, '.', '')) {
            Log::warning('PayPal capture rejected: amount mismatch', [
                'paypal_order_id' => $paypalOrderId,
                'paypal_amount' => $paypalAmount,
                'expected_total' => number_format($expectedTotal, 2, '.', ''),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'The payment amount does not match your order total. Please restart checkout.',
            ], 422);
        }

        // 5. Capture the PayPal payment
        try {
            $captureResult = $this->paypal->captureOrder($paypalOrderId);
        } catch (\RuntimeException $e) {
            Log::error('PayPal capture failed', [
                'paypal_order_id' => $paypalOrderId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment could not be processed. Please try again.',
            ], 402);
        }

        $captureStatus = $captureResult['status'] ?? '';

        // PayPal may return 'COMPLETED' even when successful
        if (! in_array($captureStatus, ['COMPLETED', 'PENDING', 'PARTIALLY_REFUNDED'], true)) {
            Log::warning('PayPal capture returned unexpected status', [
                'paypal_order_id' => $paypalOrderId,
                'status' => $captureStatus,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment was not completed. Please try again.',
            ], 402);
        }

        // 6. Create the Order via the shared OrderService (same path as pay-later orders)
        $paypalCaptureId = $this->paypal->extractCaptureId($captureResult);

        try {
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
                expectedAt: $expectedAt,
                loyaltyAccount: $loyaltyAccount,
                loyaltyRedemption: $loyaltyRedemption,
                paymentAttributes: [
                    'payment_status' => 'paid',
                    'payment_method' => 'paypal',
                    'paypal_order_id' => $paypalOrderId,
                    'paypal_capture_id' => $paypalCaptureId,
                    'paypal_payer_email' => $this->paypal->extractPayerEmail($captureResult),
                    'paypal_payer_id' => $this->paypal->extractPayerId($captureResult),
                    'amount_paid' => $this->paypal->extractCapturedAmount($captureResult),
                    'paid_at' => now(),
                ],
                shippingAddress: $fulfillmentType === 'delivery' ? [
                    'line1' => $request->string('address_line1')->toString(),
                    'line2' => $request->filled('address_line2') ? $request->string('address_line2')->toString() : null,
                    'city' => $request->string('city')->toString(),
                ] : null,
            );
        } catch (\Throwable $e) {
            Log::error('Order creation failed after PayPal capture', [
                'paypal_order_id' => $paypalOrderId,
                'paypal_capture_id' => $paypalCaptureId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Order could not be placed. Your payment was captured; please contact support.',
            ], 500);
        }

        // Reserve inventory (converts immediately to deduction since payment is already captured)
        $this->inventory->reserveForOrder($order);
        $this->inventory->convertReservationToDeduction($order);

        // Send confirmation email to customer + admin notification (queued)
        SendOrderConfirmationEmail::dispatch($order);

        $this->cart->clear();

        return response()->json([
            'success' => true,
            'redirectUrl' => URL::signedRoute('store.orders.confirmation', ['order' => $order->id]),
        ]);
    }

    /**
     * Handle incoming PayPal webhook notifications.
     *
     * PayPal sends asynchronous notifications for payment events:
     * captures, refunds, disputes, and denials. This handler verifies
     * the webhook signature, then processes the event. Returns HTTP 200
     * immediately to satisfy PayPal's acknowledgment requirement.
     */
    public function handleWebhook(Request $request): Response
    {
        $body = $request->getContent();

        if ($body === '' || $body === '0') {
            Log::warning('PayPal webhook received empty body');

            return response('', 400);
        }

        // Collect PayPal verification headers
        $verificationHeaders = [];
        foreach ($request->headers->all() as $key => $values) {
            if (str_starts_with(strtolower((string) $key), 'paypal-')) {
                $firstValue = $values[0] ?? null;
                $verificationHeaders[$key] = is_string($firstValue) ? $firstValue : '';
            }
        }

        // Verify webhook signature with PayPal
        if (! $this->paypal->verifyWebhookSignature($body, $verificationHeaders)) {
            Log::warning('PayPal webhook signature verification failed', [
                'headers' => array_keys($verificationHeaders),
            ]);

            return response('', 400);
        }

        // Parse the event type
        try {
            /** @var array<string, mixed> $payload */
            $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            Log::error('PayPal webhook JSON parse failed');

            return response('', 400);
        }

        $eventType = $payload['event_type'] ?? '';

        Log::info('PayPal webhook received', [
            'event_type' => $eventType,
        ]);

        // Process key event types
        switch ($eventType) {
            case 'CHECKOUT.ORDER.APPROVED':
                // Order approved by buyer — no action needed (capture is synchronous in our flow)
                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                $this->handleCaptureCompleted($payload);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
                $this->handleCaptureDenied($payload);
                break;

            case 'PAYMENT.CAPTURE.REFUNDED':
                $this->handleCaptureRefunded($payload);
                break;

            case 'PAYMENT.CAPTURE.REVERSED':
                $this->handleCaptureReversed($payload);
                break;

            default:
                Log::info('PayPal webhook: unhandled event type', [
                    'event_type' => $eventType,
                ]);
                break;
        }

        return response('', 200);
    }

    /**
     * Handle PAYMENT.CAPTURE.COMPLETED webhook.
     *
     * Updates the order's payment status if it was not already set (e.g.,
     * if the frontend capture-order call failed but PayPal still processed
     * the payment).
     *
     * @param  array<string, mixed>  $payload
     */
    private function handleCaptureCompleted(array $payload): void
    {
        $resource = $payload['resource'] ?? [];
        $paypalOrderId = $resource['supplementary_data']['related_ids']['order_id'] ?? null;

        if ($paypalOrderId === null || ! is_string($paypalOrderId)) {
            Log::warning('PayPal webhook: CAPTURE.COMPLETED missing order_id');

            return;
        }

        $order = Order::where('paypal_order_id', $paypalOrderId)->first();

        if (! $order instanceof Order) {
            Log::warning('PayPal webhook: no order found for CAPTURE.COMPLETED', [
                'paypal_order_id' => $paypalOrderId,
            ]);

            return;
        }

        // Only update if not already marked paid
        if ($order->payment_status !== 'paid') {
            $order->update([
                'payment_status' => 'paid',
                'paypal_capture_id' => $resource['id'] ?? $order->paypal_capture_id,
                'amount_paid' => $resource['amount']['value'] ?? $order->amount_paid,
                'paid_at' => $order->paid_at ?? now(),
            ]);

            Log::info('Order payment status updated via webhook', [
                'order_id' => $order->id,
                'paypal_order_id' => $paypalOrderId,
            ]);
        }
    }

    /**
     * Handle PAYMENT.CAPTURE.DENIED webhook.
     *
     * @param  array<string, mixed>  $payload
     */
    private function handleCaptureDenied(array $payload): void
    {
        Log::warning('PayPal webhook: capture denied', [
            'resource_id' => $payload['resource']['id'] ?? 'unknown',
        ]);
    }

    /**
     * Handle PAYMENT.CAPTURE.REFUNDED webhook.
     *
     * @param  array<string, mixed>  $payload
     */
    private function handleCaptureRefunded(array $payload): void
    {
        $captureId = $payload['resource']['id'] ?? null;

        if ($captureId === null || ! is_string($captureId)) {
            return;
        }

        $order = Order::where('paypal_capture_id', $captureId)->first();

        if (! $order instanceof Order) {
            Log::warning('PayPal webhook: no order found for refund', [
                'capture_id' => $captureId,
            ]);

            return;
        }

        $order->update([
            'payment_status' => 'refunded',
        ]);

        Log::info('Order marked as refunded via webhook', [
            'order_id' => $order->id,
            'capture_id' => $captureId,
        ]);
    }

    /**
     * Handle PAYMENT.CAPTURE.REVERSED webhook (chargeback).
     *
     * @param  array<string, mixed>  $payload
     */
    private function handleCaptureReversed(array $payload): void
    {
        $captureId = $payload['resource']['id'] ?? null;

        Log::error('PayPal webhook: chargeback/reversal detected', [
            'capture_id' => $captureId,
            'reason' => $payload['resource']['status_details']['reason'] ?? 'unknown',
        ]);
    }

    /**
     * Resolve the shipping amount from the request for createOrder preview.
     *
     * Performs a lightweight zone lookup to include delivery cost in the
     * PayPal order amount so the customer sees the full total up front.
     */
    /**
     * Resolve delivery zone, normalized postcode, and shipping amount.
     *
     * @return array{
     *     zone: ?DeliveryZone,
     *     postcode: ?string,
     *     shipping_amount: float,
     *     error: ?string
     * }
     */
    private function resolveDeliveryDetails(
        string $fulfillmentType,
        mixed $postcode,
        float $subtotal,
    ): array {
        if ($fulfillmentType !== 'delivery') {
            return [
                'zone' => null,
                'postcode' => null,
                'shipping_amount' => 0.0,
                'error' => null,
            ];
        }

        if (! is_string($postcode) || $postcode === '') {
            return [
                'zone' => null,
                'postcode' => null,
                'shipping_amount' => 0.0,
                'error' => 'Enter a postcode for delivery.',
            ];
        }

        $normalizedPostcode = DeliveryZoneMatcher::normalize($postcode);

        if ($normalizedPostcode === null) {
            return [
                'zone' => null,
                'postcode' => null,
                'shipping_amount' => 0.0,
                'error' => 'Enter a postcode for delivery.',
            ];
        }

        $zone = $this->deliveryZoneMatcher->find($normalizedPostcode);

        if (! $zone instanceof DeliveryZone) {
            return [
                'zone' => null,
                'postcode' => $normalizedPostcode,
                'shipping_amount' => 0.0,
                'error' => 'Outside delivery zone.',
            ];
        }

        if ($zone->min_order_amount !== null && $subtotal < (float) $zone->min_order_amount) {
            return [
                'zone' => $zone,
                'postcode' => $normalizedPostcode,
                'shipping_amount' => (float) $zone->delivery_price,
                'error' => 'This delivery zone requires a higher minimum order value.',
            ];
        }

        return [
            'zone' => $zone,
            'postcode' => $normalizedPostcode,
            'shipping_amount' => (float) $zone->delivery_price,
            'error' => null,
        ];
    }

    /**
     * Create a Stripe PaymentIntent for the current cart contents.
     *
     * Validates the cart, delivery zone, and loyalty redemption server-side;
     * computes the exact total; converts to pence; creates the PaymentIntent
     * via StripeService and returns the client_secret + loyalty breakdown.
     * No local Order is created yet — that happens after confirm.
     */
    public function stripeIntent(Request $request): JsonResponse
    {
        $cartContents = $this->cart->contents();

        if ($cartContents['count'] === 0) {
            return response()->json([
                'error' => 'Your cart is empty.',
            ], 422);
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'fulfillment_type' => ['required', 'in:pickup,delivery'],
            'delivery_postcode' => ['nullable', 'string', 'max:16'],
            'expected_at' => ['required', 'date_format:Y-m-d\TH:i'],
            'loyalty_points' => ['nullable', 'numeric', 'min:0'],
        ]);

        $fulfillmentType = (string) $validated['fulfillment_type'];
        $expectedAt = $this->schedule->validateExpectedAt(
            (string) $validated['expected_at'],
            $cartContents,
            $fulfillmentType,
        );
        $deliveryPostcode = $validated['delivery_postcode'] ?? null;

        $deliveryDetails = $this->resolveDeliveryDetails(
            $fulfillmentType,
            $deliveryPostcode,
            (float) $cartContents['total'],
        );

        if ($deliveryDetails['error'] !== null) {
            return response()->json([
                'error' => $deliveryDetails['error'],
            ], 422);
        }

        $shippingAmount = $deliveryDetails['shipping_amount'];
        $loyaltyAccount = $this->loyalty->accountForEmail((string) $validated['email']);
        $requestedPoints = isset($validated['loyalty_points'])
            ? (float) $validated['loyalty_points']
            : 0.0;

        $loyaltyRedemption = $this->loyalty->redemptionPreview(
            $loyaltyAccount,
            $requestedPoints,
            (float) $cartContents['total'] + $shippingAmount,
        );

        $expectedTotal = max(
            ((float) $cartContents['total'] + $shippingAmount) - $loyaltyRedemption['amount'],
            0,
        );

        if ($expectedTotal < 0.01) {
            return response()->json([
                'error' => 'Order total must be at least £0.01 for card payment.',
            ], 422);
        }

        try {
            $pi = $this->stripe->createPaymentIntent(
                amountPounds: $expectedTotal,
                extra: [
                    'description' => 'Party Eden Order',
                    'receipt_email' => (string) $validated['email'],
                    'metadata' => [
                        'expected_at' => $expectedAt->format('Y-m-d\TH:i:s\Z'),
                        'fulfillment_type' => $fulfillmentType,
                        'turnover_minutes' => (string) $this->schedule->maximumTurnoverMinutes($cartContents),
                    ],
                ],
            );
        } catch (\RuntimeException $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'error' => $e->getMessage(),
                'previous' => $e->getPrevious()?->getMessage(),
            ]);

            $message = $e->getMessage();
            if (app()->environment('production')) {
                // Never leak internal Stripe setup messages to shoppers in
                // production. Our key-guard messages above are dev-facing.
                $message = 'Could not start payment. Please try again later.';
            }

            return response()->json([
                'error' => $message,
            ], 502);
        }

        $clientSecret = $pi->client_secret ?? null;
        if (! is_string($clientSecret) || $clientSecret === '') {
            return response()->json([
                'error' => 'Could not start payment. Please try again.',
            ], 502);
        }

        return response()->json([
            'client_secret' => $clientSecret,
            'loyaltyDiscount' => $loyaltyRedemption['amount'],
            'loyaltyPoints' => $loyaltyRedemption['points'],
            'amount' => number_format($expectedTotal, 2, '.', ''),
        ]);
    }

    /**
     * Finalize a successful Stripe PaymentIntent and create the local Order.
     *
     * Called by the frontend immediately after `stripe.confirmPayment` resolves.
     * Treats the client-supplied `payment_intent_id` as untrusted — always
     * re-fetches the PaymentIntent from Stripe to verify status, amount,
     * and currency before creating the order. Mirrors captureOrder's validation
     * (delivery, stock, idempotency, amount tampering guard) byte-for-byte.
     */
    public function stripeConfirm(Request $request): JsonResponse
    {
        $cartContents = $this->cart->contents();

        if ($cartContents['count'] === 0) {
            return response()->json([
                'success' => false,
                'error' => 'Your cart is empty.',
            ], 422);
        }

        $validated = $request->validate([
            'payment_intent_id' => ['required', 'string', 'max:64'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'fulfillment_type' => ['required', 'in:pickup,delivery'],
            'expected_at' => ['required', 'date_format:Y-m-d\TH:i'],
            'delivery_postcode' => ['nullable', 'string', 'max:16'],
            'address_line1' => ['nullable', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'loyalty_points' => ['nullable', 'numeric', 'min:0'],
        ]);

        $paymentIntentId = (string) $validated['payment_intent_id'];
        $email = (string) $validated['email'];
        $firstName = (string) $validated['first_name'];
        $lastName = (string) $validated['last_name'];
        $phone = isset($validated['phone']) ? (string) $validated['phone'] : null;
        $notes = isset($validated['notes']) ? (string) $validated['notes'] : null;
        $fulfillmentType = (string) $validated['fulfillment_type'];
        $requestedLoyaltyPoints = isset($validated['loyalty_points'])
            ? (float) $validated['loyalty_points']
            : 0.0;

        $deliveryDetails = $this->resolveDeliveryDetails(
            $fulfillmentType,
            $validated['delivery_postcode'] ?? null,
            (float) $cartContents['total'],
        );

        if ($deliveryDetails['error'] !== null) {
            return response()->json([
                'success' => false,
                'error' => $deliveryDetails['error'],
            ], 422);
        }

        $deliveryZone = $deliveryDetails['zone'];
        $deliveryPostcode = $deliveryDetails['postcode'];
        $shippingAmount = (string) $deliveryDetails['shipping_amount'];

        if (Order::withTrashed()->where('stripe_payment_intent_id', $paymentIntentId)->exists()) {
            Log::warning('Stripe confirm rejected: order already exists for this PaymentIntent', [
                'payment_intent_id' => $paymentIntentId,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'This payment has already been processed.',
            ], 409);
        }

        $shortages = $this->inventory->findCartShortages($cartContents['items']);

        if ($shortages !== []) {
            return response()->json([
                'success' => false,
                'error' => $shortages[0],
            ], 422);
        }

        $loyaltyAccount = $this->loyalty->accountForEmail($email);
        $loyaltyRedemption = $this->loyalty->redemptionPreview(
            $loyaltyAccount,
            $requestedLoyaltyPoints,
            (float) $cartContents['total'] + (float) $shippingAmount,
        );

        $expectedTotal = max(
            ((float) $cartContents['total'] + (float) $shippingAmount) - $loyaltyRedemption['amount'],
            0,
        );
        $expectedPence = $this->stripe->toSmallestUnit($expectedTotal);
        $expectedCurrency = strtolower((string) config('stripe.currency', 'gbp'));

        try {
            $pi = $this->stripe->retrievePaymentIntent($paymentIntentId);
        } catch (\RuntimeException $e) {
            Log::error('Stripe retrievePaymentIntent failed before confirm', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            $message = $e->getMessage();
            if (app()->environment('production')) {
                $message = 'Payment could not be verified. Please try again.';
            }

            return response()->json([
                'success' => false,
                'error' => $message,
            ], 402);
        }

        $metadata = $pi->metadata;
        $metadataExpectedAt = is_object($metadata) ? $metadata->expected_at : null;
        $metadataFulfillmentType = is_object($metadata) ? $metadata->fulfillment_type : null;
        $metadataTurnoverMinutes = is_object($metadata) ? $metadata->turnover_minutes : null;
        $intentCreatedAt = isset($pi->created)
            ? CarbonImmutable::createFromTimestamp((int) $pi->created, 'UTC')
            : null;

        if (
            ! is_string($metadataExpectedAt)
            || ! is_string($metadataFulfillmentType)
            || ! is_numeric($metadataTurnoverMinutes)
            || ! $intentCreatedAt instanceof CarbonImmutable
            || $metadataFulfillmentType !== $fulfillmentType
        ) {
            return response()->json([
                'success' => false,
                'error' => 'The selected fulfillment time could not be verified. Please restart checkout.',
            ], 422);
        }

        $expectedAt = $this->schedule->validateExpectedAt(
            (string) $validated['expected_at'],
            $cartContents,
            $fulfillmentType,
            $intentCreatedAt,
            (int) $metadataTurnoverMinutes,
        );

        if ($expectedAt->format('Y-m-d\TH:i:s\Z') !== $metadataExpectedAt) {
            return response()->json([
                'success' => false,
                'error' => 'The selected fulfillment time has changed. Please restart checkout.',
            ], 422);
        }

        $receivedPence = (int) ($pi->amount_received);
        $receivedCurrency = (string) ($pi->currency ?? '');
        $piStatus = (string) ($pi->status ?? '');

        if ($piStatus !== 'succeeded') {
            Log::warning('Stripe confirm rejected: PaymentIntent not succeeded', [
                'payment_intent_id' => $paymentIntentId,
                'status' => $piStatus,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment was not completed. Please try again.',
            ], 402);
        }

        if ($receivedCurrency !== $expectedCurrency || $receivedPence !== $expectedPence) {
            Log::warning('Stripe confirm rejected: amount or currency mismatch', [
                'payment_intent_id' => $paymentIntentId,
                'received_pence' => $receivedPence,
                'expected_pence' => $expectedPence,
                'received_currency' => $receivedCurrency,
                'expected_currency' => $expectedCurrency,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'The payment amount does not match your order total. Please restart checkout.',
            ], 422);
        }

        $stripeChargeId = $this->stripe->extractChargeId($pi);
        $paymentAttributes = [
            'payment_status' => 'paid',
            'payment_method' => 'stripe',
            'stripe_payment_intent_id' => $paymentIntentId,
            'stripe_charge_id' => $stripeChargeId,
            'stripe_payment_method_type' => $this->stripe->extractPaymentMethodType($pi),
            'stripe_card_last4' => $this->stripe->extractCardLast4($pi),
            'stripe_card_brand' => $this->stripe->extractCardBrand($pi),
            'amount_paid' => $this->stripe->extractAmountReceived($pi),
            'paid_at' => now(),
        ];

        try {
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
                expectedAt: $expectedAt,
                loyaltyAccount: $loyaltyAccount,
                loyaltyRedemption: $loyaltyRedemption,
                paymentAttributes: $paymentAttributes,
                shippingAddress: $fulfillmentType === 'delivery' ? [
                    'line1' => (string) $validated['address_line1'],
                    'line2' => isset($validated['address_line2']) ? (string) $validated['address_line2'] : null,
                    'city' => (string) $validated['city'],
                ] : null,
            );
        } catch (\Throwable $e) {
            Log::error('Order creation failed after Stripe payment success', [
                'payment_intent_id' => $paymentIntentId,
                'stripe_charge_id' => $stripeChargeId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Order could not be placed. Your payment was captured; please contact support.',
            ], 500);
        }

        $this->inventory->reserveForOrder($order);
        $this->inventory->convertReservationToDeduction($order);

        SendOrderConfirmationEmail::dispatch($order);

        $this->cart->clear();

        return response()->json([
            'success' => true,
            'redirectUrl' => URL::signedRoute('store.orders.confirmation', ['order' => $order->id]),
        ]);
    }

    /**
     * Handle incoming Stripe webhook notifications.
     *
     * Verifies the signature via StripeService, dispatches to typed handlers, and
     * returns HTTP 200 immediately to satisfy Stripe's ack requirement.
     */
    public function stripeWebhook(Request $request): Response
    {
        $body = $request->getContent();

        if ($body === '' || $body === '0') {
            Log::warning('Stripe webhook received empty body');

            return response('', 400);
        }

        /** @var string|null $sigHeader */
        $sigHeader = $request->headers->get('Stripe-Signature');
        if (! is_string($sigHeader) || $sigHeader === '') {
            Log::warning('Stripe webhook missing Stripe-Signature header');

            return response('', 400);
        }

        $event = $this->stripe->verifyWebhookSignature($body, $sigHeader);

        if ($event === null) {
            return response('', 400);
        }

        /** @var string */
        $eventType = $event['type'] ?? 'unknown';

        Log::info('Stripe webhook received', [
            'event_type' => $eventType,
        ]);

        switch ($eventType) {
            case 'payment_intent.succeeded':
                $this->handleStripePaymentIntentSucceeded($event);
                break;

            case 'payment_intent.payment_failed':
                $this->handleStripePaymentIntentFailed($event);
                break;

            case 'charge.refunded':
                $this->handleStripeChargeRefunded($event);
                break;

            default:
                Log::info('Stripe webhook: unhandled event type', [
                    'event_type' => $eventType,
                ]);
                break;
        }

        return response('', 200);
    }

    /**
     * Handle payment_intent.succeeded webhook (belt-and-braces fallback).
     *
     * If stripeConfirm normally marks the order paid — but if stripeConfirm crashes
     * between the Stripe API call succeeding and the Order being persisted,
     * this handler ensures the order still gets marked paid and admin
     * once Stripe confirms the charge was good.
     *
     * @param  array<string, mixed>  $event
     */
    private function handleStripePaymentIntentSucceeded(array $event): void
    {
        /** @var array<string, mixed>|null $piData */
        $piData = $event['data']['object'] ?? null;

        if (! is_array($piData)) {
            Log::warning('Stripe webhook: payment_intent.succeeded missing object');

            return;
        }

        /** @var string|null $piId */
        $piId = $piData['id'] ?? null;

        if (! is_string($piId)) {
            return;
        }

        $order = Order::where('stripe_payment_intent_id', $piId)->first();

        if (! $order instanceof Order) {
            Log::info('Stripe webhook: payment_intent.succeeded no local order yet (stripeConfirm likely pending or still running)', [
                'payment_intent_id' => $piId,
            ]);

            return;
        }

        if ($order->payment_status !== 'paid') {
            /** @var int|null $penceReceived */
            $penceReceived = $piData['amount_received'] ?? null;
            $amountReceived = is_int($penceReceived)
                ? $this->stripe->fromSmallestUnit($penceReceived)
                : $order->amount_paid;

            /** @var array<string, mixed>|null $firstCharge */
            $firstCharge = $piData['charges']['data'][0] ?? null;
            $chargeId = is_array($firstCharge) && isset($firstCharge['id']) && is_string($firstCharge['id'])
                ? $firstCharge['id']
                : $order->stripe_charge_id;

            $order->update([
                'payment_status' => 'paid',
                'stripe_charge_id' => $chargeId,
                'amount_paid' => $amountReceived,
                'paid_at' => $order->paid_at ?? now(),
            ]);

            Log::info('Order payment status updated via Stripe webhook', [
                'order_id' => $order->id,
                'payment_intent_id' => $piId,
            ]);
        }
    }

    /**
     * Handle payment_intent.payment_failed webhook.
     *
     * Normally nothing needs to happen at this point: the PI was never confirmed by the client
     * but failed upstream. Useful for logging /admin debugging /retry decisions later.
     *
     * @param  array<string, mixed>  $event
     */
    private function handleStripePaymentIntentFailed(array $event): void
    {
        /** @var array<string, mixed>|null $piData */
        $piData = $event['data']['object'] ?? null;

        $piId = is_array($piData) && isset($piData['id']) && is_string($piData['id'])
            ? $piData['id']
            : 'unknown';

        /** @var string|null $code */
        $code = $piData['last_payment_error']['code'] ?? null;
        /** @var string|null $message */
        $message = $piData['last_payment_error']['message'] ?? null;

        Log::warning('Stripe webhook: payment_intent.payment_failed', [
            'payment_intent_id' => $piId,
            'code' => $code,
            'message' => $message,
        ]);
    }

    /**
     * Handle charge.refunded webhook — mark order as refunded.
     *
     * @param  array<string, mixed>  $event
     */
    private function handleStripeChargeRefunded(array $event): void
    {
        /** @var array<string, mixed>|null $chargeData */
        $chargeData = $event['data']['object'] ?? null;

        if (! is_array($chargeData)) {
            return;
        }

        /** @var string|null $chargeId */
        $chargeId = $chargeData['id'] ?? null;
        if (! is_string($chargeId)) {
            return;
        }

        $order = Order::where('stripe_charge_id', $chargeId)->first();

        if (! $order instanceof Order) {
            Log::warning('Stripe webhook: no order found for charge.refunded', [
                'charge_id' => $chargeId,
            ]);

            return;
        }

        $order->update([
            'payment_status' => 'refunded',
        ]);

        Log::info('Order marked as refunded via Stripe webhook', [
            'order_id' => $order->id,
            'charge_id' => $chargeId,
        ]);
    }
}
