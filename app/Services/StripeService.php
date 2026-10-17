<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use RuntimeException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\PaymentIntent;
use Stripe\PaymentLink;
use Stripe\Price;
use Stripe\Refund;
use Stripe\StripeClient;
use Stripe\Webhook;
use UnexpectedValueException;

/**
 * Stripe PaymentIntents & Payment Links API integration service.
 *
 * Wraps all Stripe API interactions: PaymentIntent creation/retrieval,
 * PaymentLink creation, reconciliation-field extraction, webhook
 * signature verification, and refund creation. All amount conversions
 * between pounds-decimal (application convention) and pence-integers
 * (Stripe convention) are centralised here so callers never have to
 * worry about units.
 */
class StripeService
{
    private StripeClient $client;

    private string $currency;

    private string $webhookSecret;

    private int $webhookTolerance;

    public function __construct(?StripeClient $client = null)
    {
        $secretKey = (string) config('services.stripe.secret', '');
        $apiVersion = (string) config('stripe.api_version', '');

        if ($client !== null) {
            $this->client = $client;
        } else {
            $clientConfig = ['api_key' => $secretKey];
            if ($apiVersion !== '') {
                $clientConfig['stripe_version'] = $apiVersion;
            }
            $this->client = new StripeClient($clientConfig);
        }

        $this->currency = strtolower((string) config('stripe.currency', 'gbp'));
        $this->webhookSecret = (string) config('services.stripe.webhook.secret', '');
        $this->webhookTolerance = (int) config('stripe.webhook_tolerance', 300);
    }

    /**
     * Assert the configured secret key looks usable — not empty, not a
     * dev placeholder, and has the correct prefix for the active mode.
     *
     * Called lazily right before any action that actually sends a request
     * to Stripe that needs the secret key (not needed for local helpers
     * or signature verification, which only uses the webhook secret).
     *
     * @throws RuntimeException If the key is clearly invalid; the message
     *                          is intended to be shown directly to a
     *                          developer setting up their local sandbox.
     */
    private function assertSecretKeyUsable(): void
    {
        $secretKey = (string) config('services.stripe.secret', '');

        if ($secretKey === '') {
            throw new RuntimeException(
                'Stripe secret key is not configured. Set STRIPE_SECRET in backend/.env using a test key from https://dashboard.stripe.com/test/apikeys',
            );
        }

        // Committed placeholder values — reject up-front so the failure
        // message points to .env instead of "Invalid API Key provided".
        if (
            str_contains($secretKey, 'placeholder')
            || str_contains($secretKey, 'example')
            || str_contains($secretKey, 'changeme')
        ) {
            throw new RuntimeException(
                'Stripe secret key in backend/.env is still a placeholder. Replace STRIPE_SECRET with a real test-mode secret key from https://dashboard.stripe.com/test/apikeys',
            );
        }

        $mode = (string) config('stripe.mode', 'test');

        // Accept both standard ("sk_") and restricted ("rk_") secret keys.
        $expectedPrefixes = $mode === 'live'
            ? ['sk_live_', 'rk_live_']
            : ['sk_test_', 'rk_test_'];

        $hasValidPrefix = false;
        foreach ($expectedPrefixes as $prefix) {
            if (str_starts_with($secretKey, $prefix)) {
                $hasValidPrefix = true;
                break;
            }
        }

        if (! $hasValidPrefix) {
            throw new RuntimeException(
                sprintf(
                    'Stripe secret key has the wrong prefix for %s mode. Expected key starting with "%s" or "%s". Get one from https://dashboard.stripe.com/%sapikeys',
                    $mode === 'live' ? 'live' : 'test (sandbox)',
                    $expectedPrefixes[0],
                    $expectedPrefixes[1],
                    $mode === 'live' ? '' : 'test/',
                ),
            );
        }
    }

    /**
     * Create a PaymentIntent for the given order total (in pounds-decimal).
     *
     * The caller is responsible for computing the correct total including
     * shipping, discounts, and loyalty redemption — this method only
     * converts to the Stripe smallest-unit integer and creates the PI.
     *
     * @param  float  $amountPounds  Order total in pounds (e.g. 12.99)
     * @param  array{description?: string, receipt_email?: string, order_uuid?: string, metadata?: array<string, mixed>}  $extra
     *
     * @throws RuntimeException If the Stripe API call fails
     */
    public function createPaymentIntent(float $amountPounds, array $extra = []): PaymentIntent
    {
        $this->assertSecretKeyUsable();

        $amountPence = $this->toSmallestUnit($amountPounds);

        if ($amountPence <= 0) {
            throw new RuntimeException('Stripe PaymentIntent requires a positive amount.');
        }

        $params = [
            'amount' => $amountPence,
            'currency' => $this->currency,
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ];

        if (isset($extra['description']) && $extra['description'] !== '') {
            $params['description'] = $extra['description'];
        }
        if (isset($extra['receipt_email']) && $extra['receipt_email'] !== '') {
            $params['receipt_email'] = $extra['receipt_email'];
        }

        $metadata = $extra['metadata'] ?? [];
        if (isset($extra['order_uuid'])) {
            $metadata['order_uuid'] = $extra['order_uuid'];
        }
        if ($metadata !== []) {
            $params['metadata'] = $metadata;
        }

        try {
            return $this->client->paymentIntents->create($params);
        } catch (\Throwable $e) {
            Log::error('Stripe createPaymentIntent failed', [
                'amount_pence' => $amountPence,
                'currency' => $this->currency,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException("Stripe createPaymentIntent failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Create a one-off Stripe Price for a manual order total.
     *
     * @param  float  $amountPounds  Order total in pounds (e.g. 25.00)
     * @param  string  $productName  Description or order title for the line item
     *
     * @throws RuntimeException If the Stripe API call fails
     */
    public function createOneOffPrice(float $amountPounds, string $productName): Price
    {
        $this->assertSecretKeyUsable();

        $amountPence = $this->toSmallestUnit($amountPounds);

        if ($amountPence <= 0) {
            throw new RuntimeException('Stripe Price requires a positive amount.');
        }

        try {
            return $this->client->prices->create([
                'unit_amount' => $amountPence,
                'currency' => $this->currency,
                'product_data' => [
                    'name' => $productName,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Stripe createOneOffPrice failed', [
                'amount_pence' => $amountPence,
                'currency' => $this->currency,
                'product_name' => $productName,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException("Stripe createOneOffPrice failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Create a Stripe Payment Link for the given price.
     * Includes order metadata for webhook reconciliation.
     *
     * @param  Price|string  $price  Stripe Price instance or price ID string
     * @param  string  $orderUuid  Order UUID for reconciliation in webhooks
     * @param  string|null  $customerEmail  Optional customer email to prefill on checkout
     * @param  string|null  $redirectUrl  Optional redirect URL after successful payment
     *
     * @throws RuntimeException If the Stripe API call fails
     */
    public function createPaymentLink(
        Price|string $price,
        string $orderUuid,
        ?string $customerEmail = null,
        ?string $redirectUrl = null,
    ): PaymentLink {
        $this->assertSecretKeyUsable();

        $priceId = $price instanceof Price ? $price->id : $price;

        $params = [
            'line_items' => [
                [
                    'price' => $priceId,
                    'quantity' => 1,
                ],
            ],
            'metadata' => [
                'order_uuid' => $orderUuid,
            ],
            'restrictions' => [
                'completed_sessions' => [
                    'limit' => 1,
                ],
            ],
        ];

        if ($redirectUrl !== null && $redirectUrl !== '') {
            $params['after_completion'] = [
                'type' => 'redirect',
                'redirect' => [
                    'url' => $redirectUrl,
                ],
            ];
        }

        try {
            /** @var PaymentLink $link */
            $link = $this->client->paymentLinks->create($params);

            // If a customer email is provided, append it as a prefill query parameter
            // so the Stripe checkout page has their email already filled in.
            if ($customerEmail !== null && $customerEmail !== '') {
                $separator = str_contains($link->url, '?') ? '&' : '?';
                $link->url = $link->url.$separator.'prefilled_email='.urlencode($customerEmail);
            }

            return $link;
        } catch (\Throwable $e) {
            Log::error('Stripe createPaymentLink failed', [
                'price_id' => $priceId,
                'order_uuid' => $orderUuid,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException("Stripe createPaymentLink failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Retrieve a PaymentIntent from Stripe using its ID.
     *
     * Used server-side to re-verify a PaymentIntent's amount, status,
     * and currency before trusting a successful client-side confirm.
     */
    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        $this->assertSecretKeyUsable();

        try {
            return $this->client->paymentIntents->retrieve(
                $paymentIntentId,
                ['expand' => ['payment_method']],
            );
        } catch (\Throwable $e) {
            Log::error('Stripe retrievePaymentIntent failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException("Stripe retrievePaymentIntent failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Extract the charge ID from a succeeded PaymentIntent.
     *
     * Needed later for refunds and Stripe Dashboard reconciliation.
     */
    public function extractChargeId(PaymentIntent $pi): ?string
    {
        // Recent API versions removed the `charges` list — the charge is now
        // exposed directly on `latest_charge`.
        $latestCharge = $pi->latest_charge ?? null;
        if (is_string($latestCharge) && $latestCharge !== '') {
            return $latestCharge;
        }

        // Fallback for older API versions that still return a charges list
        $charges = $pi->charges->data ?? [];
        $firstCharge = $charges[0] ?? null;

        if ($firstCharge === null) {
            return null;
        }

        $id = $firstCharge->id ?? null;

        return is_string($id) ? $id : null;
    }

    /**
     * Find the order reference behind a PaymentIntent's Checkout Session.
     *
     * A Payment Link payment always creates a Checkout Session carrying the
     * Payment Link ID and the `order_uuid` metadata we set. This lets us
     * reconcile a payment whose webhook never reached the app (e.g. the
     * server was down while the customer paid).
     *
     * @return array{order_uuid: string|null, payment_link: string|null}|null
     */
    public function findCheckoutSessionOrderRef(string $paymentIntentId): ?array
    {
        $this->assertSecretKeyUsable();

        try {
            $sessions = $this->client->checkout->sessions->all([
                'payment_intent' => $paymentIntentId,
                'limit' => 1,
            ]);

            /** @var object|null $session */
            $session = $sessions->data[0] ?? null;
            if ($session === null) {
                return null;
            }

            $orderUuid = $session->metadata->order_uuid ?? null;
            $paymentLink = $session->payment_link ?? null;

            return [
                'order_uuid' => is_string($orderUuid) && $orderUuid !== '' ? $orderUuid : null,
                'payment_link' => is_string($paymentLink) && $paymentLink !== '' ? $paymentLink : null,
            ];
        } catch (\Throwable $e) {
            Log::warning('Stripe findCheckoutSessionOrderRef failed', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Extract the amount actually received, formatted as pounds-decimal.
     *
     * Uses `amount_received` (not requested `amount`) so partial captures
     * and adjustments are reflected correctly.
     */
    public function extractAmountReceived(PaymentIntent $pi): string
    {
        $pence = (int) ($pi->amount_received ?? 0);

        return $this->fromSmallestUnit($pence);
    }

    /**
     * Extract the last 4 digits of the card used (for receipts).
     */
    public function extractCardLast4(PaymentIntent $pi): ?string
    {
        $last4 = $this->readPaymentMethodDetails($pi, ['card', 'last4']);
        if ($last4 === null || ! is_string($last4)) {
            return null;
        }

        return $last4 !== '' ? $last4 : null;
    }

    /**
     * Extract the card brand (visa, mastercard, amex, etc.).
     */
    public function extractCardBrand(PaymentIntent $pi): ?string
    {
        $brand = $this->readPaymentMethodDetails($pi, ['card', 'brand']);
        if ($brand === null || ! is_string($brand)) {
            return null;
        }

        return $brand !== '' ? $brand : null;
    }

    /**
     * Extract the payment method type (card, ideal, apple_pay, etc.).
     */
    public function extractPaymentMethodType(PaymentIntent $pi): ?string
    {
        $type = $this->readPaymentMethodDetails($pi, ['type']);
        if ($type === null || ! is_string($type)) {
            return null;
        }

        return $type !== '' ? $type : null;
    }

    /**
     * Verify an incoming Stripe webhook signature.
     *
     * Uses Stripe SDK's strict `constructEvent` which validates:
     * timestamp (within tolerance), signature hashing, and format.
     * Returns the decoded event payload as an associative array on
     * success, or null on any failure.
     *
     * @param  string  $payload  Raw webhook POST body
     * @param  string  $signatureHeader  Stripe-Signature header value
     * @return array<string, mixed>|null Event payload or null if invalid
     */
    public function verifyWebhookSignature(string $payload, string $signatureHeader): ?array
    {
        if ($this->webhookSecret === '' || $signatureHeader === '') {
            Log::warning('Stripe webhook verification skipped: missing secret or signature header');

            return null;
        }

        try {
            $event = Webhook::constructEvent(
                $payload,
                $signatureHeader,
                $this->webhookSecret,
                $this->webhookTolerance,
            );

            return $event->toArray();
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed', [
                'reason' => $e->getMessage(),
            ]);
        } catch (UnexpectedValueException $e) {
            Log::warning('Stripe webhook payload could not be parsed', [
                'reason' => $e->getMessage(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Stripe webhook verification unexpected error', [
                'reason' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Refund a previously captured charge.
     *
     * @param  string  $chargeId  Charge ID (ch_xxx) extracted from a succeeded PaymentIntent
     * @param  float|null  $amountPounds  Null for a full refund, positive pounds-decimal for partial
     * @param  string|null  $reason  Optional refund reason (admin-only note)
     *
     * @throws RuntimeException If the Stripe API call fails
     */
    public function refundPayment(string $chargeId, ?float $amountPounds = null, ?string $reason = null): Refund
    {
        $this->assertSecretKeyUsable();

        $params = [
            'charge' => $chargeId,
        ];

        if ($amountPounds !== null) {
            $amountPence = $this->toSmallestUnit($amountPounds);
            if ($amountPence <= 0) {
                throw new RuntimeException('Partial refund amount must be positive.');
            }
            $params['amount'] = $amountPence;
        }

        if ($reason !== null && $reason !== '') {
            $params['reason'] = $reason;
        }

        try {
            return $this->client->refunds->create($params);
        } catch (\Throwable $e) {
            Log::error('Stripe refundPayment failed', [
                'charge_id' => $chargeId,
                'amount_pounds' => $amountPounds,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException("Stripe refundPayment failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Convert pounds-decimal to Stripe smallest-unit integer (pence).
     *
     * Rounds to the nearest pence to avoid floating-point loss. Must
     * be used for every amount sent to the Stripe API.
     */
    public function toSmallestUnit(float $pounds): int
    {
        return (int) round($pounds * 100);
    }

    /**
     * Convert Stripe pence integer to pounds-decimal string with 4dp.
     *
     * Formatted to 4 decimal places to match the application's
     * `decimal(12,4)` column convention for monetary fields.
     */
    public function fromSmallestUnit(int $pence): string
    {
        return number_format($pence / 100, 4, '.', '');
    }

    /**
     * Reach into a PaymentIntent and read payment_method_details safely.
     *
     * The exact shape differs by payment method and SDK hydration, so we
     * walk the nested property list returning null on any miss rather
     * than hard-coding one path.
     *
     * @param  list<string>  $path
     */
    private function readPaymentMethodDetails(PaymentIntent $pi, array $path): mixed
    {
        // Path A: directly on $pi->payment_method_details
        $current = $pi->payment_method_details ?? null;
        $valueA = $this->walkObject($current, $path);
        if ($valueA !== null) {
            return $valueA;
        }

        // Path B: via the expanded PaymentMethod ($pi->payment_method)
        $pm = $pi->payment_method ?? null;
        if (is_object($pm)) {
            $pmDetails = $pm->card ?? $pm->type ?? null;
            if (is_object($pmDetails) && $path[0] === 'card') {
                $cardPath = array_slice($path, 1);
                if ($cardPath === []) {
                    return $pmDetails;
                }

                return $this->walkObject($pmDetails, $cardPath);
            }
            if ($path === ['type'] && isset($pm->type)) {
                return $pm->type;
            }
        }

        return null;
    }

    /**
     * Walk a nested object/array by key list, returning the value or null.
     *
     * @param  list<string>  $path
     */
    private function walkObject(mixed $root, array $path): mixed
    {
        $current = $root;
        foreach ($path as $key) {
            if (is_object($current) && property_exists($current, $key)) {
                $current = $current->{$key};
            } elseif (is_array($current) && array_key_exists($key, $current)) {
                $current = $current[$key];
            } else {
                return null;
            }
        }

        return $current;
    }
}
