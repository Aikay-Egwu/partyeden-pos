<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Mail\NewOrderAdminMail;
use App\Mail\StoreOrderPaymentReceivedMail;
use App\Models\Order;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\PaypalService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * PayPal + Stripe webhook controller.
 *
 * Handles asynchronous payment events from PayPal (captures, refunds,
 * disputes, denials) and Stripe (PaymentIntents, charges, Checkout
 * Sessions). Each provider's signature is verified before the event is
 * processed, and HTTP 200 is returned immediately to satisfy the
 * provider's acknowledgment requirement.
 */
final class WebhooksController extends Controller
{
    public function __construct(
        private PaypalService $paypal,
        private StripeService $stripe,
        private InventoryService $inventory,
    ) {}

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

            case 'checkout.session.completed':
                $this->handleStripeCheckoutSessionCompleted($event);
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
     * Handle charge.refunded webhook — mark the matching order as refunded.
     *
     * A refund can arrive for a payment whose "payment received" webhook was
     * never processed (e.g. the server was down while the customer paid), so
     * matching on `stripe_charge_id` alone is not reliable. We resolve the
     * order through a chain of Stripe identifiers and finally the payer email.
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

        // PaymentIntent behind the refunded charge (used for deeper lookups).
        $paymentIntentId = $chargeData['payment_intent'] ?? null;
        $paymentIntentId = is_string($paymentIntentId) && $paymentIntentId !== '' ? $paymentIntentId : null;

        // Payer email (guests pay without an account, so this may be null).
        $billingDetails = $chargeData['billing_details'] ?? null;
        $payerEmail = is_array($billingDetails) ? ($billingDetails['email'] ?? null) : null;
        if (! is_string($payerEmail) || $payerEmail === '') {
            $payerEmail = $chargeData['receipt_email'] ?? null;
        }
        $payerEmail = is_string($payerEmail) && $payerEmail !== '' ? $payerEmail : null;

        [$order, $matchedBy] = $this->resolveOrderForRefund($chargeId, $paymentIntentId, $payerEmail);

        if (! $order instanceof Order) {
            Log::warning('Stripe webhook: no order found for charge.refunded', [
                'charge_id' => $chargeId,
                'payment_intent_id' => $paymentIntentId,
                'payer_email' => $payerEmail,
            ]);

            return;
        }

        // Record the refund and backfill any Stripe identifiers we resolved so
        // later events match this order. Existing values are left untouched.
        $order->update([
            'payment_status' => 'refunded',
            'payment_method' => 'stripe',
            'stripe_charge_id' => $order->stripe_charge_id ?: $chargeId,
            'stripe_payment_intent_id' => $order->stripe_payment_intent_id ?: $paymentIntentId,
        ]);

        Log::info('Order marked as refunded via Stripe webhook', [
            'order_id' => $order->id,
            'charge_id' => $chargeId,
            'matched_by' => $matchedBy,
        ]);
    }

    /**
     * Resolve the local order behind a Stripe refund.
     *
     * Tries, most to least reliable: stored charge ID, stored PaymentIntent
     * ID, the Checkout Session's order_uuid, the Checkout Session's payment
     * link, then the payer email. Returns the order and the identifier that
     * matched (for logging), or [null, null] when nothing matches.
     *
     * @return array{0: Order|null, 1: string|null}
     */
    private function resolveOrderForRefund(string $chargeId, ?string $paymentIntentId, ?string $payerEmail): array
    {
        // 1. Direct match on the stored charge ID — the happy path.
        $order = Order::where('stripe_charge_id', $chargeId)->first();
        if ($order instanceof Order) {
            return [$order, 'charge_id'];
        }

        if ($paymentIntentId !== null) {
            // 2. Match on the stored PaymentIntent ID.
            $order = Order::where('stripe_payment_intent_id', $paymentIntentId)->first();
            if ($order instanceof Order) {
                return [$order, 'payment_intent_id'];
            }

            // 3. Recover the order from the Checkout Session that created the
            //    payment (metadata.order_uuid, then the payment link).
            $sessionRef = $this->stripe->findCheckoutSessionOrderRef($paymentIntentId);
            if (is_array($sessionRef)) {
                $orderUuid = $sessionRef['order_uuid'];
                if (is_string($orderUuid) && $orderUuid !== '') {
                    $order = Order::find($orderUuid);
                    if ($order instanceof Order) {
                        return [$order, 'checkout_session_order_uuid'];
                    }
                }

                $paymentLink = $sessionRef['payment_link'];
                if (is_string($paymentLink) && $paymentLink !== '') {
                    $order = Order::where('stripe_payment_link_id', $paymentLink)->first();
                    if ($order instanceof Order) {
                        return [$order, 'checkout_session_payment_link'];
                    }
                }
            }
        }

        // 4. Last resort: match on the payer's email via the linked customer.
        if ($payerEmail !== null) {
            $order = Order::whereHas('customer', function ($query) use ($payerEmail): void {
                $query->where('email', $payerEmail);
            })->latest()->first();

            if ($order instanceof Order) {
                return [$order, 'payer_email'];
            }
        }

        return [null, null];
    }

    /**
     * Handle checkout.session.completed webhook (from Stripe Payment Links).
     *
     * @param  array<string, mixed>  $event
     */
    private function handleStripeCheckoutSessionCompleted(array $event): void
    {
        /** @var array<string, mixed>|null $session */
        $session = $event['data']['object'] ?? null;

        if (! is_array($session)) {
            Log::warning('Stripe webhook: checkout.session.completed missing object');

            return;
        }

        /** @var string|null $orderUuid */
        $orderUuid = $session['metadata']['order_uuid'] ?? null;

        $order = null;
        if (is_string($orderUuid) && $orderUuid !== '') {
            $order = Order::find($orderUuid);
        }

        // Fallback: search by stripe_payment_link_id if order_uuid missing
        if (! $order instanceof Order && isset($session['payment_link']) && is_string($session['payment_link'])) {
            $order = Order::where('stripe_payment_link_id', $session['payment_link'])->first();
        }

        if (! $order instanceof Order) {
            Log::warning('Stripe webhook: checkout.session.completed no matching order found', [
                'session_id' => $session['id'] ?? null,
                'order_uuid' => $orderUuid,
                'payment_link' => $session['payment_link'] ?? null,
            ]);

            return;
        }

        // Idempotency: if already paid, do nothing
        if ($order->payment_status === 'paid') {
            Log::info('Stripe webhook: checkout.session.completed order already paid', [
                'order_id' => $order->id,
            ]);

            return;
        }

        /** @var string|null $piId */
        $piId = $session['payment_intent'] ?? null;
        $chargeId = null;
        $cardLast4 = null;
        $cardBrand = null;
        $methodType = null;
        $amountReceived = null;

        // If PaymentIntent ID is present, retrieve PI details for card/charge info
        if (is_string($piId) && $piId !== '') {
            try {
                $pi = $this->stripe->retrievePaymentIntent($piId);
                $chargeId = $this->stripe->extractChargeId($pi);
                $cardLast4 = $this->stripe->extractCardLast4($pi);
                $cardBrand = $this->stripe->extractCardBrand($pi);
                $methodType = $this->stripe->extractPaymentMethodType($pi);
                $amountReceived = $this->stripe->extractAmountReceived($pi);
            } catch (\Throwable $e) {
                Log::warning('Stripe webhook: could not retrieve PI details for checkout session', [
                    'payment_intent_id' => $piId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($amountReceived === null && isset($session['amount_total']) && is_int($session['amount_total'])) {
            $amountReceived = $this->stripe->fromSmallestUnit($session['amount_total']);
        }

        $order->update([
            'payment_status' => 'paid',
            'payment_method' => 'stripe',
            'stripe_payment_intent_id' => is_string($piId) ? $piId : $order->stripe_payment_intent_id,
            'stripe_charge_id' => $chargeId ?? $order->stripe_charge_id,
            'stripe_card_last4' => $cardLast4 ?? $order->stripe_card_last4,
            'stripe_card_brand' => $cardBrand ?? $order->stripe_card_brand,
            'stripe_payment_method_type' => $methodType ?? 'card',
            'amount_paid' => $amountReceived ?? $order->total,
            'paid_at' => $order->paid_at ?? now(),
        ]);

        // Stock deduction
        try {
            $this->inventory->reserveForOrder($order);
            $this->inventory->convertReservationToDeduction($order);
        } catch (\Throwable $e) {
            Log::error('Stripe webhook: stock reservation/deduction failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Email customer: payment received confirmation
        $order->loadMissing(['customer', 'items']);
        /** @var string|null $customerEmail */
        $customerEmail = $order->customer?->email;
        if (! $customerEmail && isset($session['customer_details']['email']) && is_string($session['customer_details']['email'])) {
            $customerEmail = $session['customer_details']['email'];
        }

        if ($customerEmail) {
            try {
                Mail::to($customerEmail)->send(new StoreOrderPaymentReceivedMail($order));
            } catch (\Throwable $e) {
                Log::error('Stripe webhook: sending payment received email failed', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Also notify admin team
        $admins = User::all()->filter(fn (User $user): bool => $user->hasPermission('admin'));
        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->send(new NewOrderAdminMail($order));
            } catch (\Throwable $e) {
                Log::error('Stripe webhook: sending admin email failed', [
                    'order_id' => $order->id,
                    'admin_id' => $admin->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Order payment status updated to paid via checkout.session.completed', [
            'order_id' => $order->id,
            'amount_paid' => $order->amount_paid,
        ]);
    }
}
