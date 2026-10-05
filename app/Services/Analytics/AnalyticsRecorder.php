<?php

namespace App\Services\Analytics;

use App\Jobs\RecordAnalyticsEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Decides whether a request is a page view, and if so buffers a plain array of
 * already-derived facts about it.
 *
 * Two rules shape this class. First: nothing here queries the database, reads
 * the cache or touches the filesystem, because capture() runs inside the
 * request. Everything expensive belongs to the job that flush() dispatches.
 * Second: everything that could identify a person is reduced to a bucket
 * (a country, a browser name, a normalised path) and then dropped.
 */
class AnalyticsRecorder
{
    /**
     * @var array<string, mixed>|null
     */
    private ?array $pending = null;

    public function __construct(
        private readonly GeoLocator $geo,
        private readonly UserAgentParser $userAgents,
    ) {}

    public function capture(Request $request): void
    {
        if (! $this->shouldRecord($request)) {
            return;
        }

        $agent = (string) $request->userAgent();
        $path = $this->normalisePath($request);

        if ($path === null) {
            return;
        }

        $visitHash = $this->visitHash($request, $agent);

        // Deterministic sampling: a visitor is consistently in or out, so a
        // 25% sample reads as a quarter of the traffic, not as random noise.
        if (crc32($visitHash) % 100 >= max(0, min(100, (int) config('analytics.sample_rate')))) {
            return;
        }

        $this->pending = [
            'visit_hash' => $visitHash,
            'kind' => 'page_view',
            'path' => $path,
            'referrer_host' => $this->referrerHost($request),
            'country' => $this->geo->country($request->ip()),
            'locale' => $this->locale($request),
            // A string, not a Carbon: job payloads stay trivially serialisable.
            'recorded_at' => now()->toDateTimeString(),
        ] + $this->userAgents->parse($agent);

        if (config('analytics.track_returning')) {
            $this->pending['cohort_key'] = $this->cohortKey($request, $agent);
        }
    }

    public function flush(Request $request, Response $response): void
    {
        if ($this->pending === null) {
            return;
        }

        $event = $this->pending;
        $this->pending = null;

        // Redirects, errors and 404s are not visits. Counting them inflates the
        // homepage with every unauthenticated bounce off /login.
        if ($response->getStatusCode() >= 400 || $response->isRedirect()) {
            return;
        }

        RecordAnalyticsEvent::dispatch($event)
            ->onConnection(config('analytics.connection'))
            ->onQueue(config('analytics.queue'));
    }

    private function shouldRecord(Request $request): bool
    {
        if (! config('analytics.enabled')) {
            return false;
        }

        if (! $request->isMethodCacheable() || ! $request->acceptsHtml()) {
            return false;
        }

        $agent = (string) $request->userAgent();

        if ($agent === '') {
            return false;
        }

        foreach ((array) config('analytics.bots', []) as $bot) {
            if (stripos($agent, (string) $bot) !== false) {
                return false;
            }
        }

        // Our own office, staging and uptime monitors. Compared against the
        // address the request actually arrived from, so it is only as accurate
        // as the TRUSTED_PROXIES configuration in front of PHP.
        if (in_array($request->ip(), (array) config('analytics.exclude_ips', []), true)) {
            return false;
        }

        $path = '/'.ltrim($request->getPathInfo(), '/');

        foreach ((array) config('analytics.skip_paths', []) as $pattern) {
            if (Str::is((string) $pattern, $path)) {
                return false;
            }
        }

        // Asset requests that still reach the front controller.
        return pathinfo($path, PATHINFO_EXTENSION) === '';
    }

    /**
     * Query strings carry search terms, e-mail addresses and campaign identities,
     * so they are dropped outright rather than redacted.
     */
    private function normalisePath(Request $request): ?string
    {
        $path = '/'.trim($request->getPathInfo(), '/');

        foreach ((array) config('analytics.normalise', []) as $pattern => $replacement) {
            $replaced = preg_replace((string) $pattern, (string) $replacement, $path);

            if (is_string($replaced)) {
                $path = $replaced;
            }
        }

        $path = Str::lower(rawurldecode($path));

        // Reject anything that is not a plain path rather than sanitising it:
        // a decoded control character or NUL has no business in a counter key.
        if (preg_match('#^[\p{L}\p{N}\-._~/\*% ]+$#u', $path) !== 1) {
            return null;
        }

        return Str::limit($path, 160, '');
    }

    private function referrerHost(Request $request): ?string
    {
        $referrer = $request->headers->get('referer');

        if (! is_string($referrer) || $referrer === '') {
            return null;
        }

        $host = parse_url($referrer, PHP_URL_HOST);

        if (! is_string($host) || $host === '') {
            return null;
        }

        // Internal navigation is not a referral, and leaving it in produces a
        // top referrer of "our own site" that hides the real acquisition source.
        if ($host === parse_url((string) config('app.url'), PHP_URL_HOST)) {
            return null;
        }

        return Str::limit(Str::lower(Str::before($host, 'www.')), 128, '');
    }

    private function locale(Request $request): ?string
    {
        $language = $request->getLanguages()[0] ?? null;

        return is_string($language) ? Str::limit(Str::lower(str_replace('_', '-', $language)), 5, '') : null;
    }

    /**
     * A salted, masked, rotating pseudonym.
     *
     * Masking to /24 (IPv4) and /64 (IPv6) keeps enough entropy that visitors on
     * genuinely different connections hash apart, while removing the host octet
     * that would make the value a precise identifier. The bucket makes it
     * rotate, so nothing here can chain one visitor across days.
     */
    private function visitHash(Request $request, string $agent): string
    {
        $bucket = match (config('analytics.visit_bucket')) {
            'week' => now()->startOfWeek()->toDateString(),
            'hour' => now()->format('YmdH'),
            default => now()->toDateString(),
        };

        return substr(hash_hmac('sha256', $this->mask($request->ip()).'|'.$agent.'|'.$bucket, $this->salt()), 0, 16);
    }

    private function mask(?string $ip): string
    {
        if ($ip === null || $ip === '') {
            return 'unknown';
        }

        if (str_contains($ip, ':')) {
            // IPv6 allocation is /64 per subnet, so keep the first four groups.
            return implode(':', array_slice(explode(':', $ip), 0, 4));
        }

        return (string) preg_replace('/\.\d+$/', '', $ip);
    }

    /**
     * The one deliberately longer-lived pseudonym, and the reason
     * ANALYTICS_TRACK_RETURNING is off by default. It exists only to answer
     * "have we seen this connection before within the lookback window?" and is
     * never written to the database - the aggregator reduces it to a boolean.
     */
    private function cohortKey(Request $request, string $agent): string
    {
        return substr(hash_hmac('sha256', $this->mask($request->ip()).'|'.$agent.'|cohort', $this->salt()), 0, 32);
    }

    private function salt(): string
    {
        return (string) (config('analytics.salt') ?: config('app.key'));
    }
}
