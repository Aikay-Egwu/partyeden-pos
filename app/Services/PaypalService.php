<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * PayPal REST API v2 integration service.
 *
 * Wraps all PayPal API interactions: OAuth token management, order creation,
 * order capture, refunds, and webhook signature verification.
 */
final class PaypalService
{
    private string $baseUrl;

    private string $clientId;

    private string $clientSecret;

    private string $webhookId;

    private int $tokenCacheTtl;

    /** Cache key for the OAuth access token. */
    private const TOKEN_CACHE_KEY = 'paypal_access_token';

    public function __construct()
    {
        $this->clientId = (string) config('paypal.client_id');
        $this->clientSecret = (string) config('paypal.client_secret');
        $this->webhookId = (string) config('paypal.webhook_id');
        $this->tokenCacheTtl = (int) config('paypal.token_cache_ttl', 50);

        $mode = config('paypal.mode', 'sandbox');
        $this->baseUrl = $mode === 'live'
            ? (string) config('paypal.live_base_url', 'https://api-m.paypal.com')
            : (string) config('paypal.sandbox_base_url', 'https://api-m.sandbox.paypal.com');
    }

    /**
     * Obtain an OAuth 2.0 access token from PayPal.
     *
     * Tokens are cached for slightly less than the 60-minute PayPal expiry
     * to avoid mid-request expiration.
     */
    public function getAccessToken(): string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, now()->addMinutes($this->tokenCacheTtl), function (): string {
            $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                ->asForm()
                ->post("{$this->baseUrl}/v1/oauth2/token", [
                    'grant_type' => 'client_credentials',
                ]);

            if (! $response->successful()) {
                Log::error('PayPal OAuth token request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new RuntimeException('Failed to obtain PayPal access token.');
            }

            /** @var string $token */
            $token = $response->json('access_token');

            return $token;
        });
    }

    /**
     * Create a PayPal order for the given amount.
     *
     * @param  float  $amount  Order total in the configured currency
     * @param  string|null  $currency  Three-letter ISO currency code (defaults to config)
     * @param  array{order_uuid?: string, description?: string}  $metadata  Optional reconciliation data
     * @return array<string, mixed>
     *
     * @throws RuntimeException|ConnectionException
     */
    public function createOrder(float $amount, ?string $currency = null, array $metadata = []): array
    {
        $currency = $currency ?? (string) config('paypal.currency', 'GBP');
        $accessToken = $this->getAccessToken();

        $purchaseUnit = [
            'amount' => [
                'currency_code' => $currency,
                'value' => number_format($amount, 2, '.', ''),
            ],
        ];

        if (isset($metadata['order_uuid'])) {
            $purchaseUnit['custom_id'] = $metadata['order_uuid'];
        }

        if (isset($metadata['description'])) {
            $purchaseUnit['description'] = $metadata['description'];
        }

        try {
            $response = Http::withToken($accessToken)
                ->withHeader('PayPal-Request-Id', $this->generateRequestId())
                ->post("{$this->baseUrl}/v2/checkout/orders", [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [$purchaseUnit],
                ])
                ->throw(fn ($response, $e) => $this->logAndThrow('createOrder', $response));

            /** @var array<string, mixed> $data */
            $data = $response->json();

            return $data;
        } catch (RequestException $e) {
            throw new RuntimeException("PayPal createOrder failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Capture a previously created PayPal order.
     *
     * @param  string  $paypalOrderId  The PayPal order ID from createOrder
     * @return array<string, mixed>
     *
     * @throws RuntimeException|ConnectionException
     */
    public function captureOrder(string $paypalOrderId): array
    {
        $accessToken = $this->getAccessToken();

        try {
            $response = Http::withToken($accessToken)
                ->withHeader('PayPal-Request-Id', $this->generateRequestId())
                ->post("{$this->baseUrl}/v2/checkout/orders/{$paypalOrderId}/capture", [
                    'note_to_payer' => 'Thank you for your order with Party Eden.',
                ])
                ->throw(fn ($response, $e) => $this->logAndThrow('captureOrder', $response));

            /** @var array<string, mixed> $data */
            $data = $response->json();

            return $data;
        } catch (RequestException $e) {
            throw new RuntimeException("PayPal captureOrder failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Retrieve order details from PayPal.
     *
     * Useful for verifying order status server-side before fulfilling.
     *
     * @return array<string, mixed>
     */
    public function getOrder(string $paypalOrderId): array
    {
        $accessToken = $this->getAccessToken();

        try {
            $response = Http::withToken($accessToken)
                ->get("{$this->baseUrl}/v2/checkout/orders/{$paypalOrderId}")
                ->throw(fn ($response, $e) => $this->logAndThrow('getOrder', $response));

            /** @var array<string, mixed> $data */
            $data = $response->json();

            return $data;
        } catch (RequestException $e) {
            throw new RuntimeException("PayPal getOrder failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Refund a captured PayPal payment.
     *
     * @param  string  $captureId  The PayPal capture ID from a successful captureOrder call
     * @param  float|null  $amount  Null for full refund, a positive value for partial
     * @param  string|null  $note  Optional note to the payer
     * @return array<string, mixed>
     */
    public function refundCapture(string $captureId, ?float $amount = null, ?string $note = null): array
    {
        $accessToken = $this->getAccessToken();

        $payload = [];
        if ($amount !== null) {
            $currency = (string) config('paypal.currency', 'GBP');
            $payload['amount'] = [
                'value' => number_format($amount, 2, '.', ''),
                'currency_code' => $currency,
            ];
        }
        if ($note !== null && $note !== '') {
            $payload['note_to_payer'] = $note;
        }

        try {
            $response = Http::withToken($accessToken)
                ->withHeader('PayPal-Request-Id', $this->generateRequestId())
                ->post("{$this->baseUrl}/v2/payments/captures/{$captureId}/refund", $payload)
                ->throw(fn ($response, $e) => $this->logAndThrow('refundCapture', $response));

            /** @var array<string, mixed> $data */
            $data = $response->json();

            return $data;
        } catch (RequestException $e) {
            throw new RuntimeException("PayPal refundCapture failed: {$e->getMessage()}", 0, $e);
        }
    }

    /**
     * Verify a PayPal webhook notification signature.
     *
     * PayPal sends webhook payloads with verification headers. This method
     * calls PayPal's verify-webhook-signature endpoint to confirm authenticity.
     *
     * @param  string  $body  Raw POST body from the webhook
     * @param  array<string, string>  $headers  Webhook verification headers (PAYPAL-*)
     * @return bool True if the webhook signature is verified
     */
    public function verifyWebhookSignature(string $body, array $headers): bool
    {
        $accessToken = $this->getAccessToken();

        // Required headers from PayPal webhook notifications
        $requiredHeaders = [
            'paypal-transmission-id',
            'paypal-transmission-time',
            'paypal-transmission-sig',
            'paypal-cert-url',
            'paypal-auth-algo',
        ];

        $verificationHeaders = [];
        foreach ($requiredHeaders as $header) {
            $key = $this->findHeaderKey($header, $headers);
            if ($key === null) {
                Log::warning('PayPal webhook missing required header', ['header' => $header]);

                return false;
            }
            $verificationHeaders[$header] = $headers[$key];
        }

        try {
            $response = Http::withToken($accessToken)
                ->post("{$this->baseUrl}/v1/notifications/verify-webhook-signature", [
                    'auth_algo' => $verificationHeaders['paypal-auth-algo'],
                    'cert_url' => $verificationHeaders['paypal-cert-url'],
                    'transmission_id' => $verificationHeaders['paypal-transmission-id'],
                    'transmission_sig' => $verificationHeaders['paypal-transmission-sig'],
                    'transmission_time' => $verificationHeaders['paypal-transmission-time'],
                    'webhook_id' => $this->webhookId,
                    'webhook_event' => json_decode($body, true, 512, JSON_THROW_ON_ERROR),
                ]);

            /** @var string $verificationStatus */
            $verificationStatus = $response->json('verification_status', '');

            return $verificationStatus === 'SUCCESS';
        } catch (\JsonException $e) {
            Log::error('PayPal webhook body could not be decoded', [
                'error' => $e->getMessage(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('PayPal webhook verification failed', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Extract the payer email from a captured order result.
     *
     * @param  array<string, mixed>  $captureResult
     */
    public function extractPayerEmail(array $captureResult): ?string
    {
        $payer = $captureResult['payer'] ?? [];

        return isset($payer['email_address']) && is_string($payer['email_address'])
            ? $payer['email_address']
            : null;
    }

    /**
     * Extract the payer ID from a captured order result.
     *
     * @param  array<string, mixed>  $captureResult
     */
    public function extractPayerId(array $captureResult): ?string
    {
        $payer = $captureResult['payer'] ?? [];

        return isset($payer['payer_id']) && is_string($payer['payer_id'])
            ? $payer['payer_id']
            : null;
    }

    /**
     * Extract the first capture ID from a captured order result.
     *
     * @param  array<string, mixed>  $captureResult
     */
    public function extractCaptureId(array $captureResult): ?string
    {
        $captures = $captureResult['purchase_units'][0]['payments']['captures'] ?? [];

        return isset($captures[0]['id']) && is_string($captures[0]['id'])
            ? $captures[0]['id']
            : null;
    }

    /**
     * Extract the captured amount from the capture result.
     *
     * @param  array<string, mixed>  $captureResult
     */
    public function extractCapturedAmount(array $captureResult): ?string
    {
        $captures = $captureResult['purchase_units'][0]['payments']['captures'] ?? [];

        return isset($captures[0]['amount']['value']) && is_string($captures[0]['amount']['value'])
            ? $captures[0]['amount']['value']
            : null;
    }

    /**
     * Generate an idempotency key for PayPal API requests.
     *
     * PayPal-Request-Id headers ensure idempotent retries.
     */
    private function generateRequestId(): string
    {
        return bin2hex(random_bytes(16));
    }

    /**
     * Log a failed PayPal API call for use with Http::throw().
     */
    private function logAndThrow(string $method, Response $response): void
    {
        Log::error("PayPal {$method} request failed", [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);
    }

    /**
     * Case-insensitive search for a header key.
     *
     * @param  array<string, string>  $headers
     */
    private function findHeaderKey(string $needle, array $headers): ?string
    {
        foreach ($headers as $key => $value) {
            if (strtolower($key) === $needle) {
                return $key;
            }
        }

        return null;
    }
}
