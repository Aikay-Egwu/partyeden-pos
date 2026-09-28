<?php

declare(strict_types=1);

use App\Models\Order;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // The webhook route is already registered in routes/store.php but we
    // still mock StripeService to avoid hitting the real Stripe API.
    Route::post('payment/stripe-webhook', 'App\Http\Controllers\Store\StorePaymentController@stripeWebhook')
        ->name('store.payment.stripe-webhook.test');
});

function mockWebhookVerify(?array $eventPayload): void
{
    $mock = Mockery::mock(StripeService::class)->makePartial();
    $mock->shouldReceive('verifyWebhookSignature')
        ->andReturn($eventPayload);
    app()->instance(StripeService::class, $mock);
}

function makePaymentIntentPayload(string $piId, int $amountPence, ?string $chargeId = null): array
{
    return [
        'id' => $piId,
        'amount_received' => $amountPence,
        'charges' => [
            'data' => $chargeId !== null ? [
                ['id' => $chargeId],
            ] : [],
        ],
    ];
}

test('stripe webhook returns 400 for empty body', function (): void {
    $response = $this->postJson('payment/stripe-webhook', []);

    $response->assertStatus(400);
});

test('stripe webhook returns 400 when signature verification fails', function (): void {
    mockWebhookVerify(null);

    $response = $this->postJson('payment/stripe-webhook', [
        'id' => 'evt_1',
        'type' => 'payment_intent.succeeded',
    ], ['Stripe-Signature' => 't=1,v1=bad']);

    $response->assertStatus(400);
});

test('stripe webhook processes payment_intent.succeeded and marks unpaid order as paid', function (): void {
    $order = Order::create([
        'order_number' => 'ORD-20260101-STRIPE1',
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'stripe_payment_intent_id' => 'pi_test_succeeded_1',
        'subtotal' => '25.00',
        'total' => '25.50',
    ]);

    $event = [
        'id' => 'evt_test_succeeded_1',
        'type' => 'payment_intent.succeeded',
        'data' => [
            'object' => makePaymentIntentPayload(
                'pi_test_succeeded_1',
                2550,
                'ch_test_charge_1',
            ),
        ],
    ];
    mockWebhookVerify($event);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->stripe_charge_id)->toBe('ch_test_charge_1');
    expect($order->amount_paid)->toBe('25.5000');
    expect($order->paid_at)->not->toBeNull();
});

test('stripe webhook skips order that is already paid on payment_intent.succeeded', function (): void {
    $originalPaidAt = now()->subDay();
    $order = Order::create([
        'order_number' => 'ORD-20260101-STRIPE2',
        'payment_status' => 'paid',
        'payment_method' => 'stripe',
        'stripe_payment_intent_id' => 'pi_test_succeeded_2',
        'stripe_charge_id' => 'ch_original',
        'amount_paid' => '25.0000',
        'paid_at' => $originalPaidAt,
        'subtotal' => '25.00',
        'total' => '25.00',
    ]);

    $event = [
        'id' => 'evt_test_succeeded_2',
        'type' => 'payment_intent.succeeded',
        'data' => [
            'object' => makePaymentIntentPayload(
                'pi_test_succeeded_2',
                2500,
                'ch_new_from_webhook',
            ),
        ],
    ];
    mockWebhookVerify($event);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    // Values must be unchanged
    expect($order->stripe_charge_id)->toBe('ch_original');
});

test('stripe webhook marks order refunded on charge.refunded', function (): void {
    $order = Order::create([
        'order_number' => 'ORD-20260101-STRIPE3',
        'payment_status' => 'paid',
        'payment_method' => 'stripe',
        'stripe_payment_intent_id' => 'pi_test_refunded_1',
        'stripe_charge_id' => 'ch_test_refund_1',
        'amount_paid' => '30.0000',
        'subtotal' => '30.00',
        'total' => '30.00',
    ]);

    $event = [
        'id' => 'evt_test_refunded_1',
        'type' => 'charge.refunded',
        'data' => [
            'object' => [
                'id' => 'ch_test_refund_1',
            ],
        ],
    ];
    mockWebhookVerify($event);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('refunded');
});

test('stripe webhook returns 200 for unhandled event types', function (): void {
    $event = [
        'id' => 'evt_ignore',
        'type' => 'customer.created',
        'data' => ['object' => ['id' => 'cus_123']],
    ];
    mockWebhookVerify($event);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);
});
