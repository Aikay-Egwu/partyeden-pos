<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Analytics
    |--------------------------------------------------------------------------
    |
    | Cookie-less, first-party analytics. Page views are captured by a
    | terminable middleware on the Laravel request (Inertia navigations are
    | real server requests, so no client JavaScript is required) and written
    | after the response has been flushed.
    |
    */

    'enabled' => env('ANALYTICS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Sampling
    |--------------------------------------------------------------------------
    |
    | Percentage of traffic to record, 0-100. Sampling is deterministic on the
    | visitor hash, so a visitor is consistently in or out and ratios stay
    | interpretable. Under load, lower this instead of letting the queue back
    | up.
    |
    */

    'sample_rate' => (int) env('ANALYTICS_SAMPLE_RATE', 100),

    /*
    |--------------------------------------------------------------------------
    | Write path
    |--------------------------------------------------------------------------
    |
    | "deferred" runs the recording job after the response is sent, which needs
    | no queue worker. Switch to "database" or "redis" once a worker is running
    | on the queue named below.
    |
    */

    'connection' => env('ANALYTICS_QUEUE_CONNECTION', 'deferred'),

    'queue' => env('ANALYTICS_QUEUE', 'analytics'),

    /*
    |--------------------------------------------------------------------------
    | Storage engines
    |--------------------------------------------------------------------------
    |
    | raw      keep per-event rows in analytics_events. This is what makes the
    |          referrer, browser, device and language breakdowns (and per-page
    |          drill-down) possible, so turning it off costs you those reports.
    | rollups  maintain the daily counter tables the dashboard reads from.
    |          "none" records raw events only.
    | shards   number of counter rows per (date, key). Spread writes over more
    |          shards when a single hot row (e.g. the homepage) starts to lock.
    |
    */

    'raw' => env('ANALYTICS_RAW', true),

    'rollups' => env('ANALYTICS_ROLLUPS', 'inline'),

    'shards' => max(1, (int) env('ANALYTICS_SHARDS', 8)),

    /*
    |--------------------------------------------------------------------------
    | Retention
    |--------------------------------------------------------------------------
    |
    | Raw events are the only bulky, short-lived data, and the breakdown reports
    | are limited to this window. The visitor ledgers hold nothing but rotating
    | salted hashes and a country code, so they are kept much longer to make
    | historical unique-visitor and per-country counts exact.
    |
    */

    'retention_days' => (int) env('ANALYTICS_RETENTION_DAYS', 90),

    'ledger_retention_days' => (int) env('ANALYTICS_LEDGER_RETENTION_DAYS', 365),

    /*
    |--------------------------------------------------------------------------
    | Privacy
    |--------------------------------------------------------------------------
    |
    | salt     HMAC secret for the visitor hash. Rotate to instantly invalidate
    |          every previously issued pseudonym. Generate with:
    |          php -r "echo bin2hex(random_bytes(32));"
    | visit_bucket  How often the visitor hash rotates. "day" means a visitor
    |          cannot be followed across days; "week" enables returning-visitor
    |          reporting at the cost of a longer-lived pseudonym.
    | track_returning  New vs returning classification. Deciding it requires a
    |          pseudonym that outlives a single day, held in the cache for
    |          returning_lookback_days. Only the boolean is stored, never the
    |          identifier it was derived from - but unlike everything else here
    |          it is a longer-lived pseudonym, so it is off by default.
    |
    */

    'salt' => env('ANALYTICS_SALT'),

    'visit_bucket' => env('ANALYTICS_VISIT_BUCKET', 'day'),

    'track_returning' => env('ANALYTICS_TRACK_RETURNING', false),

    'returning_lookback_days' => (int) env('ANALYTICS_RETURNING_LOOKBACK_DAYS', 45),

    /*
    |--------------------------------------------------------------------------
    | Geolocation
    |--------------------------------------------------------------------------
    |
    | Resolved in-request from the client address against a local MaxMind
    | compatible database. The address itself is never persisted and never
    | placed in a job payload; only the two letter ISO code survives.
    |
    | Set ANALYTICS_GEO=none to disable, or point ANALYTICS_GEO_DATABASE at a
    | GeoLite2-Country / GeoCP / IP2Location LITE .mmdb file.
    |
    */

    'geo' => env('ANALYTICS_GEO', 'country'),

    'geo_database' => env('ANALYTICS_GEO_DATABASE', storage_path('app/private/geo/GeoLite2-Country.mmdb')),

    /*
    |--------------------------------------------------------------------------
    | Noise filtering
    |--------------------------------------------------------------------------
    */

    'skip_paths' => [
        '/up',
        '/api', '/api/*',
        '/mapps-admin', '/mapps-admin/*',
        '/storage/*',
        '/build/*',
        '/hot/*',
        '/sanctum/*',
        '/webhooks/*',
        '/_ignition/*',
        '/_debugbar/*',
        '/favicon.ico',
        '/robots.txt',
        '/apple-touch-icon.png',
        '/favicon.svg',
        '/logo.svg',
        '/manifest.json',
        '/sitemap.xml',
    ],

    /*
    |--------------------------------------------------------------------------
    | Path normalisation
    |--------------------------------------------------------------------------
    |
    | Collapses identifiers into a wildcard so slugs are neither stored nor
    | spread the "top pages" ranking across thousands of one-hit rows.
    |
    */

    'normalise' => [
        '#^/team/[^/]+$#' => '/team/*',
        '#^/news/[^/]+$#' => '/news/*',
        '#^/password/reset/[^/]+$#' => '/password/reset/*',
        '#^/verify-email/[^/]+$#' => '/verify-email/*',
    ],

    /*
    |--------------------------------------------------------------------------
    | Bots and crawlers
    |--------------------------------------------------------------------------
    |
    | Matched case-insensitively as substrings of the user agent. The user agent
    | string itself is parsed and discarded; only browser / os / device survive.
    |
    */

    'bots' => [
        'bot', 'crawl', 'spider', 'slurp', 'curl', 'wget', 'python-requests', 'go-http-client',
        'java/', 'okhttp', 'headless', 'phantomjs', 'lighthouse', 'pagespeed', 'gtmetrix',
        'pingdom', 'uptimerobot', 'statuspage', 'sentry', 'datadog', 'newrelic', 'curlbot',
        'semrush', 'ahrefs', 'majestic', 'dotbot', 'petalbot', 'bytespider', 'puppeteer',
    ],

    /*
    |--------------------------------------------------------------------------
    | Addresses never geolocated
    |--------------------------------------------------------------------------
    |
    | Loopback has no location, and reading it as if it did is how local traffic
    | turns up as somebody else's country. Private and reserved ranges are
    | already filtered out by the routability check, so this list only needs the
    | public addresses you want to keep out of the country report.
    |
    | It does not stop a visit being counted - see exclude_ips for that.
    |
    */

    'internal_ips' => [
        '127.0.0.1', '::1',
    ],

    /*
    |--------------------------------------------------------------------------
    | Addresses never counted
    |--------------------------------------------------------------------------
    |
    | Your own office, staging and uptime monitors, so that testing the site
    | does not inflate the numbers you are trying to read.
    |
    | Be careful what you put here. Until TRUSTED_PROXIES is configured, every
    | visitor arrives as the local proxy's address, so listing that address
    | would silently switch the whole feature off rather than filtering noise.
    | Run php artisan analytics:geo-check to see what is configured.
    |
    | Comma separated: ANALYTICS_EXCLUDE_IPS=203.0.113.4,198.51.100.7
    |
    */

    'exclude_ips' => array_values(array_filter(
        array_map('trim', explode(',', (string) env('ANALYTICS_EXCLUDE_IPS', '')))
    )),

];
