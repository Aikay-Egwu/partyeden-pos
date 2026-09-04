<?php

declare(strict_types=1);

use App\Services\PaypalService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function (): void {
    Config::set('paypal.mode', 'sandbox');
    Config::set('paypal.client_id', 'test-client-id');
    Config::set('paypal.client_secret', 'test-client-secret');
    Config::set('paypal.webhook_id', 'test-webhook-id');
    Config::set('paypal.sandbox_base_url', 'https://api-m.sandbox.paypal.com');
    Config::set('paypal.live_base_url', 'https://api-m.paypal.com');
    Config::set('paypal.currency', 'GBP');
    Config::set('paypal.token_cache_ttl', 50);

    // Mock the OAuth token endpoint
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
            'access_token' => 'fake-access-token',
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ], 200),
    ]);
});

test('getAccessToken returns cached token', function (): void {
    $service = new PaypalService;

    $token = $service->getAccessToken();

    expect($token)->toBe('fake-access-token');
});

test('getAccessToken reuses cached token', function (): void {
    $service = new PaypalService;

    // First call — makes HTTP request
    $token1 = $service->getAccessToken();

    // Second call — should use cache
    $token2 = $service->getAccessToken();

    expect($token1)->toBe('fake-access-token');
    expect($token2)->toBe('fake-access-token');

    // Only one HTTP request should have been made
    Http::assertSentCount(1);
});

test('createOrder makes correct API call', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response([
            'id' => 'ORDER-123',
            'status' => 'CREATED',
            'links' => [
                ['rel' => 'approve', 'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123'],
            ],
        ], 201),
    ]);

    $service = new PaypalService;

    $result = $service->createOrder(25.50, 'GBP', [
        'order_uuid' => 'test-uuid',
        'description' => 'Test Order',
    ]);

    expect($result['id'])->toBe('ORDER-123');
    expect($result['status'])->toBe('CREATED');

    Http::assertSent(function ($request): bool {
        $body = $request->data();

        return $request->url() === 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
            && $body['intent'] === 'CAPTURE'
            && $body['purchase_units'][0]['amount']['currency_code'] === 'GBP'
            && $body['purchase_units'][0]['amount']['value'] === '25.50'
            && $body['purchase_units'][0]['custom_id'] === 'test-uuid'
            && $body['purchase_units'][0]['description'] === 'Test Order';
    });
});

test('captureOrder makes correct API call', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-123/capture' => Http::response([
            'id' => 'ORDER-123',
            'status' => 'COMPLETED',
            'purchase_units' => [
                [
                    'payments' => [
                        'captures' => [
                            [
                                'id' => 'CAPTURE-456',
                                'status' => 'COMPLETED',
                                'amount' => [
                                    'currency_code' => 'GBP',
                                    'value' => '25.50',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'payer' => [
                'email_address' => 'buyer@example.com',
                'payer_id' => 'PAYER-789',
            ],
        ], 201),
    ]);

    $service = new PaypalService;

    $result = $service->captureOrder('ORDER-123');

    expect($result['status'])->toBe('COMPLETED');
    expect($service->extractCaptureId($result))->toBe('CAPTURE-456');
    expect($service->extractPayerEmail($result))->toBe('buyer@example.com');
    expect($service->extractPayerId($result))->toBe('PAYER-789');
    expect($service->extractCapturedAmount($result))->toBe('25.50');
});

test('refundCapture makes correct API call', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v2/payments/captures/CAPTURE-456/refund' => Http::response([
            'id' => 'REFUND-789',
            'status' => 'COMPLETED',
        ], 201),
    ]);

    $service = new PaypalService;

    $result = $service->refundCapture('CAPTURE-456', 10.00, 'Partial refund');

    expect($result['id'])->toBe('REFUND-789');
    expect($result['status'])->toBe('COMPLETED');

    Http::assertSent(function ($request): bool {
        $body = $request->data();

        return $request->url() === 'https://api-m.sandbox.paypal.com/v2/payments/captures/CAPTURE-456/refund'
            && $body['amount']['value'] === '10.00'
            && $body['note_to_payer'] === 'Partial refund';
    });
});

test('verifyWebhookSignature returns true for valid signature', function (): void {
    $webhookBody = json_encode(['event_type' => 'PAYMENT.CAPTURE.COMPLETED']);

    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
            'verification_status' => 'SUCCESS',
        ], 200),
    ]);

    $service = new PaypalService;

    $result = $service->verifyWebhookSignature($webhookBody, [
        'Paypal-Transmission-Id' => 'txn-123',
        'Paypal-Transmission-Time' => '2024-01-01T00:00:00Z',
        'Paypal-Transmission-Sig' => 'sig-abc',
        'Paypal-Cert-Url' => 'https://api.paypal.com/v1/notifications/certs/CERT-ID',
        'Paypal-Auth-Algo' => 'SHA256withRSA',
    ]);

    expect($result)->toBeTrue();
});

test('verifyWebhookSignature returns false for invalid signature', function (): void {
    $webhookBody = json_encode(['event_type' => 'PAYMENT.CAPTURE.COMPLETED']);

    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
            'verification_status' => 'FAILURE',
        ], 200),
    ]);

    $service = new PaypalService;

    $result = $service->verifyWebhookSignature($webhookBody, [
        'Paypal-Transmission-Id' => 'txn-123',
        'Paypal-Transmission-Time' => '2024-01-01T00:00:00Z',
        'Paypal-Transmission-Sig' => 'sig-abc',
        'Paypal-Cert-Url' => 'https://api.paypal.com/v1/notifications/certs/CERT-ID',
        'Paypal-Auth-Algo' => 'SHA256withRSA',
    ]);

    expect($result)->toBeFalse();
});

test('extract methods return null for empty capture result', function (): void {
    $service = new PaypalService;

    expect($service->extractPayerEmail([]))->toBeNull();
    expect($service->extractPayerId([]))->toBeNull();
    expect($service->extractCaptureId([]))->toBeNull();
    expect($service->extractCapturedAmount([]))->toBeNull();
});
