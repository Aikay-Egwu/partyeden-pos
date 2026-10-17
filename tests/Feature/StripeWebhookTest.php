<?php

declare(strict_types=1);

use App\Mail\StoreOrderPaymentReceivedMail;
use App\Models\Customer;
use App\Models\Order;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Stripe\PaymentIntent;

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

test('stripe webhook refund resolves order by payment_intent when charge id missing', function (): void {
    // This order never received a payment webhook, so no charge id was stored.
    $order = Order::create([
        'order_number' => 'ORD-20260101-STRIPE-RFND-PI',
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'stripe_payment_intent_id' => 'pi_refund_fallback_1',
        'subtotal' => '15.00',
        'total' => '15.00',
    ]);

    $event = [
        'id' => 'evt_test_refunded_pi',
        'type' => 'charge.refunded',
        'data' => [
            'object' => [
                'id' => 'ch_refund_fallback_1',
                'payment_intent' => 'pi_refund_fallback_1',
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
    // The resolved charge id is backfilled so future events match directly.
    expect($order->stripe_charge_id)->toBe('ch_refund_fallback_1');
});

test('stripe webhook refund resolves order via checkout session when no ids stored', function (): void {
    $order = Order::create([
        'order_number' => 'ORD-20260101-STRIPE-RFND-CS',
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'subtotal' => '20.00',
        'total' => '20.00',
    ]);

    $event = [
        'id' => 'evt_test_refunded_cs',
        'type' => 'charge.refunded',
        'data' => [
            'object' => [
                'id' => 'ch_refund_fallback_cs',
                'payment_intent' => 'pi_refund_fallback_cs',
            ],
        ],
    ];

    // The Checkout Session is the only link back to the order here.
    $mock = Mockery::mock(StripeService::class)->makePartial();
    $mock->shouldReceive('verifyWebhookSignature')->andReturn($event);
    $mock->shouldReceive('findCheckoutSessionOrderRef')
        ->with('pi_refund_fallback_cs')
        ->andReturn([
            'order_uuid' => $order->id,
            'payment_link' => null,
        ]);
    app()->instance(StripeService::class, $mock);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('refunded');
});

test('stripe webhook refund resolves order by payer email as last resort', function (): void {
    $customer = Customer::create([
        'first_name' => 'Refund',
        'last_name' => 'Guest',
        'email' => 'refund.guest@example.com',
        'phone' => '07700900456',
        'is_active' => true,
    ]);

    $order = Order::create([
        'order_number' => 'ORD-20260101-STRIPE-RFND-EM',
        'customer_id' => $customer->id,
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'subtotal' => '10.00',
        'total' => '10.00',
    ]);

    $event = [
        'id' => 'evt_test_refunded_email',
        'type' => 'charge.refunded',
        'data' => [
            'object' => [
                'id' => 'ch_refund_fallback_email',
                'payment_intent' => 'pi_refund_fallback_email',
                'billing_details' => [
                    'email' => 'refund.guest@example.com',
                ],
            ],
        ],
    ];

    // No Checkout Session match — force the email fallback path.
    $mock = Mockery::mock(StripeService::class)->makePartial();
    $mock->shouldReceive('verifyWebhookSignature')->andReturn($event);
    $mock->shouldReceive('findCheckoutSessionOrderRef')->andReturn(null);
    app()->instance(StripeService::class, $mock);

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

test('stripe webhook processes checkout.session.completed and marks store order as paid', function (): void {
    Mail::fake();

    $customer = Customer::create([
        'first_name' => 'Alice',
        'last_name' => 'Store',
        'email' => 'alice.store@example.com',
        'phone' => '07700900123',
        'is_active' => true,
    ]);

    $order = Order::create([
        'order_number' => 'ORD-STORE-WHATSAPP-01',
        'customer_id' => $customer->id,
        'order_source' => 'whatsapp',
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'stripe_payment_link_id' => 'plink_test_wh_1',
        'stripe_payment_link_url' => 'https://buy.stripe.com/test_wh_1',
        'subtotal' => '45.00',
        'total' => '45.00',
    ]);

    $event = [
        'id' => 'evt_test_checkout_session_1',
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test_session_1',
                'payment_intent' => 'pi_checkout_test_1',
                'payment_link' => 'plink_test_wh_1',
                'amount_total' => 4500,
                'metadata' => [
                    'order_uuid' => $order->id,
                    'order_number' => $order->order_number,
                ],
                'customer_details' => [
                    'email' => 'alice.store@example.com',
                ],
            ],
        ],
    ];

    $mock = Mockery::mock(StripeService::class)->makePartial();
    $mock->shouldReceive('verifyWebhookSignature')
        ->andReturn($event);

    $dummyPi = new PaymentIntent('pi_checkout_test_1');
    $mock->shouldReceive('retrievePaymentIntent')
        ->with('pi_checkout_test_1')
        ->andReturn($dummyPi);
    $mock->shouldReceive('extractChargeId')
        ->with($dummyPi)
        ->andReturn('ch_checkout_charge_1');
    $mock->shouldReceive('extractCardLast4')
        ->with($dummyPi)
        ->andReturn('4242');
    $mock->shouldReceive('extractCardBrand')
        ->with($dummyPi)
        ->andReturn('visa');
    $mock->shouldReceive('extractPaymentMethodType')
        ->with($dummyPi)
        ->andReturn('card');
    $mock->shouldReceive('extractAmountReceived')
        ->with($dummyPi)
        ->andReturn('45.0000');
    app()->instance(StripeService::class, $mock);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->stripe_payment_intent_id)->toBe('pi_checkout_test_1');
    expect($order->stripe_charge_id)->toBe('ch_checkout_charge_1');
    expect($order->stripe_card_last4)->toBe('4242');
    expect($order->stripe_card_brand)->toBe('visa');
    expect($order->paid_at)->not->toBeNull();

    Mail::assertSent(StoreOrderPaymentReceivedMail::class);
});

test('stripe webhook checkout.session.completed resolves order by payment_link fallback', function (): void {
    Mail::fake();

    $order = Order::create([
        'order_number' => 'ORD-STORE-PHONE-02',
        'order_source' => 'phone',
        'payment_status' => 'unpaid',
        'payment_method' => 'stripe',
        'stripe_payment_link_id' => 'plink_fallback_test_2',
        'stripe_payment_link_url' => 'https://buy.stripe.com/test_fallback_2',
        'subtotal' => '30.00',
        'total' => '30.00',
    ]);

    $event = [
        'id' => 'evt_test_checkout_session_2',
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test_session_2',
                'payment_link' => 'plink_fallback_test_2',
                'amount_total' => 3000,
                'metadata' => [],
            ],
        ],
    ];

    $mock = Mockery::mock(StripeService::class)->makePartial();
    $mock->shouldReceive('verifyWebhookSignature')
        ->andReturn($event);
    app()->instance(StripeService::class, $mock);

    $response = $this->postJson('payment/stripe-webhook', $event, [
        'Stripe-Signature' => 't=123,v1=mock',
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->amount_paid)->toBe('30.0000');
});
