<?php

/**
 * PayPal REST API configuration.
 *
 * Uses PayPal REST API v2 for checkout orders, captures, refunds, and webhooks.
 * Sandbox mode uses api-m.sandbox.paypal.com; live mode uses api-m.paypal.com.
 */
return [

    /*
    |--------------------------------------------------------------------------
    | PayPal Mode
    |--------------------------------------------------------------------------
    |
    | 'sandbox' for testing, 'live' for production payments.
    |
    */
    'mode' => env('PAYPAL_MODE', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | REST API Credentials
    |--------------------------------------------------------------------------
    |
    | Generated from the PayPal Developer Dashboard (developer.paypal.com).
    | Sandbox and live credentials are separate.
    |
    */
    'client_id' => env('PAYPAL_CLIENT_ID', ''),
    'client_secret' => env('PAYPAL_CLIENT_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | Webhook ID
    |--------------------------------------------------------------------------
    |
    | The webhook ID registered in the PayPal Developer Dashboard. Used to
    | verify incoming webhook signatures.
    |
    */
    'webhook_id' => env('PAYPAL_WEBHOOK_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | Base URLs
    |--------------------------------------------------------------------------
    |
    | Determined automatically from the mode, but available for override if
    | needed (e.g. testing against a mock server).
    |
    */
    'sandbox_base_url' => env('PAYPAL_SANDBOX_URL', 'https://api-m.sandbox.paypal.com'),
    'live_base_url' => env('PAYPAL_LIVE_URL', 'https://api-m.paypal.com'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | Three-letter ISO currency code. The application uses GBP.
    |
    */
    'currency' => env('PAYPAL_CURRENCY', 'GBP'),

    /*
    |--------------------------------------------------------------------------
    | Access Token Cache TTL (minutes)
    |--------------------------------------------------------------------------
    |
    | PayPal OAuth tokens expire after 60 minutes. Cache for slightly less
    | to avoid edge-case expiry mid-request.
    |
    */
    'token_cache_ttl' => (int) env('PAYPAL_TOKEN_CACHE_TTL', 50),

];
