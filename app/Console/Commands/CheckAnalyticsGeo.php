<?php

namespace App\Console\Commands;

use App\Services\Analytics\GeoLocator;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckAnalyticsGeo extends Command
{
    protected $signature = 'analytics:geo-check {--ip=* : Additional address to probe (repeatable)}';

    protected $description = 'Verify the analytics geolocation database and privacy-critical settings';

    public function handle(GeoLocator $geo): int
    {
        $mode = (string) config('analytics.geo');
        $path = (string) config('analytics.geo_database');

        $this->line('Mode: <fg=cyan>'.$mode.'</>');
        $this->line('Database: '.$path);

        if ($mode !== 'country') {
            $this->warn('Geolocation is disabled; country will be recorded as null.');
        }

        if (! is_readable($path)) {
            $this->error('Not readable. Download GeoLite2-Country (free, needs a MaxMind licence key) - or an open-licensed alternative such as GeoCP - and place it at the path above, or set ANALYTICS_GEO=none.');
            $this->line('    mkdir -p '.escapeshellarg(dirname($path)).' && chmod 775 '.escapeshellarg(dirname($path)));

            return self::FAILURE;
        }

        $age = (int) Carbon::createFromTimestamp((int) filemtime($path))->diffInDays(now());
        $this->line(sprintf('Size %s MB, last modified %d days ago.', number_format(filesize($path) / 1048576, 1), $age));

        $this->line(extension_loaded('maxminddb')
            ? 'Reader: ext-maxminddb, so the database is memory mapped.'
            : 'Reader: pure PHP. Installing ext-maxminddb memory maps the database and makes every in-request lookup several times cheaper.');

        if ($age > 40) {
            $this->warn('The database is over 40 days old; MaxMind refreshes monthly, and the licence requires redistribution of updates be avoided.');
        }

        foreach ($this->probes() as $ip) {
            $this->line(sprintf('  %-22s => %s', $ip, $geo->country($ip) ?? 'no result'));
        }

        $this->line('');
        $this->check('ANALYTICS_ENABLED', config('analytics.enabled') ? 'on' : 'off - nothing at all is being recorded');
        $this->check('ANALYTICS_SAMPLE_RATE', ((string) config('analytics.sample_rate')).'% of visitors');
        $this->check('ANALYTICS_RAW', config('analytics.raw') ? 'on - referrer, device, browser and language breakdowns available' : 'off - counters only, breakdowns disabled');
        $this->check('ANALYTICS_SALT', config('analytics.salt') ? 'set' : 'falling back to APP_KEY (works, but rotating the app key resets every visitor pseudonym silently)');
        $this->check('TRUSTED_PROXIES', $this->trustedProxiesStatus());
        $this->check('EXCLUDED ADDRESSES', $this->excludedAddresses());
        $this->check('ANALYTICS_QUEUE_CONNECTION', (string) config('analytics.connection').($this->workerRunning() ? '' : ' (no worker assumed: "deferred" runs post-response, which is correct here)'));
        $this->check('ANALYTICS_TRACK_RETURNING', config('analytics.track_returning') ? 'on - stores a longer-lived pseudonym in the cache' : 'off');

        return self::SUCCESS;
    }

    /**
     * @return list<string>
     */
    private function probes(): array
    {
        /** @var mixed $option */
        $option = $this->option('ip');
        $values = is_array($option) ? $option : (is_string($option) && $option !== '' ? [$option] : []);
        $userIps = [];
        foreach ($values as $v) {
            if (is_string($v) && $v !== '') {
                $userIps[] = $v;
            }
        }

        return array_values(array_unique(array_merge(
            ['127.0.0.1', '10.0.0.5', '8.8.8.8'],
            $userIps,
        )));
    }

    /**
     * Human-readable status for the framework's trusted proxy configuration.
     *
     * Reads the underlying $_ENV directly so the diagnostic keeps working after
     * `config:cache` (TRUSTED_PROXIES is consumed by bootstrap and never placed
     * in a config entry).
     */
    private function trustedProxiesStatus(): string
    {
        $value = $_ENV['TRUSTED_PROXIES'] ?? $_SERVER['TRUSTED_PROXIES'] ?? null;

        if (is_string($value) && $value !== '') {
            return $value;
        }

        return 'unset - if nginx fronts PHP, $request->ip() returns the proxy and every visitor shares one pseudonym';
    }

    /**
     * Addresses whose visits are dropped entirely. Worth printing because a
     * proxy address listed here, with TRUSTED_PROXIES unset, silently switches
     * the whole feature off instead of filtering noise.
     */
    private function excludedAddresses(): string
    {
        $excluded = array_values(array_filter((array) config('analytics.exclude_ips', []), 'is_string'));

        return $excluded === [] ? 'none' : implode(', ', $excluded);
    }

    private function check(string $label, string $value): void
    {
        $this->line(sprintf('%-28s %s', $label.':', $value));
    }

    private function workerRunning(): bool
    {
        return in_array((string) config('analytics.connection'), ['database', 'redis', 'beanstalkd', 'sqs'], true);
    }
}
