<?php

/**
 * Stripe payment configuration.
 *
 * Uses Stripe PaymentIntents API for SCA-compliant card payments.
 * Sandbox mode uses test keys; live mode uses live keys.
 * API keys and webhook secret are loaded from config/services.stripe.
 */
return [

    /*
    |--------------------------------------------------------------------------
    | Stripe Mode
    |--------------------------------------------------------------------------
    |
    | 'test' for sandbox testing (uses STRIPE_KEY/SECRET test values),
    | 'live' for production charges.
    |
    */
    'mode' => env('STRIPE_MODE', 'test'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | Three-letter ISO currency code in lowercase. Party Eden uses GBP.
    |
    */
    'currency' => strtolower((string) env('STRIPE_CURRENCY', 'GBP')),

    /*
    |--------------------------------------------------------------------------
    | Stripe API Version
    |--------------------------------------------------------------------------
    |
    | Pin the API version so Stripe behaviour stays predictable even when
    | the SDK or your account default version is upgraded.
    | Empty string uses the SDK's default / your account default.
    |
    */
    'api_version' => env('STRIPE_API_VERSION', ''),

    /*
    |--------------------------------------------------------------------------
    | Webhook Tolerance (seconds)
    |--------------------------------------------------------------------------
    |
    | Maximum allowed clock-skew between Stripe webhook timestamp and now.
    | Stripe docs recommend 300 seconds (5 minutes).
    |
    */
    'webhook_tolerance' => (int) env('STRIPE_WEBHOOK_TOLERANCE', 300),

];
