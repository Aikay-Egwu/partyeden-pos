<?php

declare(strict_types=1);

use App\Services\StripeService;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('services.stripe.key', 'pk_test_fake');
    Config::set('services.stripe.secret', 'sk_test_fake');
    Config::set('services.stripe.webhook.secret', 'whsec_fake');
    Config::set('stripe.mode', 'test');
    Config::set('stripe.currency', 'GBP');
    Config::set('stripe.api_version', '');
    Config::set('stripe.webhook_tolerance', 300);
});

test('toSmallestUnit converts pounds to pence with rounding', function (): void {
    $service = new StripeService;

    expect($service->toSmallestUnit(0.01))->toBe(1);
    expect($service->toSmallestUnit(1.00))->toBe(100);
    expect($service->toSmallestUnit(99.99))->toBe(9999);
    expect($service->toSmallestUnit(25.50))->toBe(2550);
    // Floating-point edge: 0.075 rounds to 8p
    expect($service->toSmallestUnit(0.075))->toBe(8);
    // Floating-point edge: 0.004 rounds to 0p
    expect($service->toSmallestUnit(0.004))->toBe(0);
});

test('fromSmallestUnit converts pence to pounds formatted with 4dp', function (): void {
    $service = new StripeService;

    expect($service->fromSmallestUnit(1))->toBe('0.0100');
    expect($service->fromSmallestUnit(100))->toBe('1.0000');
    expect($service->fromSmallestUnit(9999))->toBe('99.9900');
    expect($service->fromSmallestUnit(2550))->toBe('25.5000');
    expect($service->fromSmallestUnit(0))->toBe('0.0000');
});

test('amount roundtrip is lossless for realistic values', function (): void {
    $service = new StripeService;

    $amounts = [0.50, 1.99, 15.00, 49.95, 120.00, 999.99];
    foreach ($amounts as $pounds) {
        $pence = $service->toSmallestUnit($pounds);
        $back = (float) $service->fromSmallestUnit($pence);

        // Round to 2dp to tolerate the 4dp storage format
        expect(round($back, 2))->toBe(round($pounds, 2));
    }
});

test('createPaymentIntent throws on zero or negative amount', function (): void {
    $service = new StripeService;

    $this->expectException(RuntimeException::class);
    $service->createPaymentIntent(0.0);
});

test('verifyWebhookSignature returns null for empty secret or header', function (): void {
    $service = new StripeService;

    Config::set('services.stripe.webhook.secret', '');
    $result = $service->verifyWebhookSignature('{"id":"evt_1"}', 't=123,v1=abc');
    expect($result)->toBeNull();

    Config::set('services.stripe.webhook.secret', 'whsec_abc');
    $result2 = $service->verifyWebhookSignature('{"id":"evt_1"}', '');
    expect($result2)->toBeNull();
});

test('verifyWebhookSignature returns null on invalid signature', function (): void {
    $service = new StripeService;

    // Valid-looking JSON but signature will never match without correct hmac
    $payload = json_encode(['id' => 'evt_test123', 'type' => 'payment_intent.succeeded']);
    $fakeSigHeader = 't='.time().',v1=badsignaturevalue';

    $result = $service->verifyWebhookSignature($payload, $fakeSigHeader);

    expect($result)->toBeNull();
});
