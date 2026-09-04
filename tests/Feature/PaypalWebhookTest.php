<?php

declare(strict_types=1);

use App\Http\Controllers\Store\StorePaymentController;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // Register the webhook route for testing
    Route::post('api/paypal/webhook', [StorePaymentController::class, 'handleWebhook'])
        ->name('api.paypal.webhook');

    // Mock PayPal OAuth
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
            'access_token' => 'fake-token',
            'token_type' => 'Bearer',
            'expires_in' => 3600,
        ], 200),
    ]);
});

test('webhook returns 400 for empty body', function (): void {
    $response = $this->postJson('api/paypal/webhook', []);

    $response->assertStatus(400);
});

test('webhook returns 400 when signature verification fails', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
            'verification_status' => 'FAILURE',
        ], 200),
    ]);

    $response = $this->postJson('api/paypal/webhook', [
        'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
        'resource' => ['id' => 'CAP-123'],
    ], [
        'Paypal-Transmission-Id' => 'txn-1',
        'Paypal-Transmission-Time' => '2024-01-01T00:00:00Z',
        'Paypal-Transmission-Sig' => 'sig-abc',
        'Paypal-Cert-Url' => 'https://api.paypal.com/certs/CERT-1',
        'Paypal-Auth-Algo' => 'SHA256withRSA',
    ]);

    $response->assertStatus(400);
});

test('webhook processes PAYMENT_CAPTURE_COMPLETED event', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
            'verification_status' => 'SUCCESS',
        ], 200),
    ]);

    $order = Order::create([
        'order_number' => 'ORD-20260101-ABC123',
        'payment_status' => 'unpaid',
        'payment_method' => 'paypal',
        'paypal_order_id' => 'PAYPAL-ORDER-123',
        'subtotal' => '50.00',
        'total' => '50.00',
    ]);

    $response = $this->postJson('api/paypal/webhook', [
        'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
        'resource' => [
            'id' => 'CAPTURE-456',
            'amount' => ['value' => '50.00', 'currency_code' => 'GBP'],
            'supplementary_data' => [
                'related_ids' => [
                    'order_id' => 'PAYPAL-ORDER-123',
                ],
            ],
        ],
    ], [
        'Paypal-Transmission-Id' => 'txn-1',
        'Paypal-Transmission-Time' => '2024-01-01T00:00:00Z',
        'Paypal-Transmission-Sig' => 'sig-abc',
        'Paypal-Cert-Url' => 'https://api.paypal.com/certs/CERT-1',
        'Paypal-Auth-Algo' => 'SHA256withRSA',
    ]);

    $response->assertStatus(200);

    // Verify order was updated
    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->paypal_capture_id)->toBe('CAPTURE-456');
    expect($order->amount_paid)->toBe('50.0000');
    expect($order->paid_at)->not->toBeNull();
});

test('webhook handles PAYMENT_CAPTURE_REFUNDED event', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
            'verification_status' => 'SUCCESS',
        ], 200),
    ]);

    $order = Order::create([
        'order_number' => 'ORD-20260101-XYZ789',
        'payment_status' => 'paid',
        'payment_method' => 'paypal',
        'paypal_capture_id' => 'CAPTURE-789',
        'subtotal' => '30.00',
        'total' => '30.00',
    ]);

    $response = $this->postJson('api/paypal/webhook', [
        'event_type' => 'PAYMENT.CAPTURE.REFUNDED',
        'resource' => [
            'id' => 'CAPTURE-789',
        ],
    ], [
        'Paypal-Transmission-Id' => 'txn-2',
        'Paypal-Transmission-Time' => '2024-01-01T00:00:00Z',
        'Paypal-Transmission-Sig' => 'sig-def',
        'Paypal-Cert-Url' => 'https://api.paypal.com/certs/CERT-1',
        'Paypal-Auth-Algo' => 'SHA256withRSA',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('refunded');
});

test('webhook does not update order if already paid', function (): void {
    Http::fake([
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
            'verification_status' => 'SUCCESS',
        ], 200),
    ]);

    $order = Order::create([
        'order_number' => 'ORD-20260101-DEF456',
        'payment_status' => 'paid',
        'payment_method' => 'paypal',
        'paypal_order_id' => 'PAYPAL-ORDER-123',
        'paypal_capture_id' => 'CAP-ORIGINAL',
        'subtotal' => '40.00',
        'total' => '40.00',
        'paid_at' => now()->subDay(),
    ]);

    $response = $this->postJson('api/paypal/webhook', [
        'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
        'resource' => [
            'id' => 'CAPTURE-NEW',
            'supplementary_data' => [
                'related_ids' => [
                    'order_id' => 'PAYPAL-ORDER-123',
                ],
            ],
        ],
    ], [
        'Paypal-Transmission-Id' => 'txn-3',
        'Paypal-Transmission-Time' => '2024-01-01T00:00:00Z',
        'Paypal-Transmission-Sig' => 'sig-ghi',
        'Paypal-Cert-Url' => 'https://api.paypal.com/certs/CERT-1',
        'Paypal-Auth-Algo' => 'SHA256withRSA',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    // Should remain unchanged since already paid
    expect($order->paypal_capture_id)->toBe('CAP-ORIGINAL');
});
