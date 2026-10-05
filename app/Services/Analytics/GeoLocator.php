<?php

namespace App\Services\Analytics;

use GeoIp2\Database\Reader;
use GeoIp2\Exception\AddressNotFoundException;
use Throwable;

/**
 * Resolves an approximate country from a local MaxMind compatible database.
 *
 * The address is read here and nowhere else: it never reaches a job payload,
 * the log, or the database. With QUEUE_CONNECTION=database a value placed in a
 * job constructor would be serialised into the jobs table, which is how an
 * "anonymous" analytics system quietly ends up retaining every visitor's IP.
 * That is why this runs during the request and returns a two letter code.
 */
class GeoLocator
{
    /**
     * Set once the database has been found missing or unopenable, so the rest of
     * the process does not keep stat-ing a path that will not appear by itself.
     */
    private bool $unavailable = false;

    private bool $warned = false;

    public function __construct(
        private ?string $database = null,
        private ?Reader $reader = null,
    ) {}

    /**
     * @return string|null Two letter ISO 3166-1 alpha-2 code, or null.
     */
    public function country(?string $ip): ?string
    {
        if (config('analytics.geo') !== 'country' || ! $this->isRoutable($ip)) {
            return null;
        }

        $reader = $this->reader();

        if ($reader === null) {
            return null;
        }

        try {
            $code = $reader->country($ip)->country->isoCode;
        } catch (AddressNotFoundException) {
            // A routable address the database simply has no record for.
            return null;
        } catch (Throwable $e) {
            // Telemetry must never be the reason a page fails to render.
            logger()->debug('Analytics geo lookup skipped.', ['reason' => $e->getMessage()]);

            return null;
        }

        return is_string($code) && preg_match('/^[A-Z]{2}$/', $code) === 1 ? $code : null;
    }

    /**
     * Loopback, private and reserved ranges carry no location, and reading them
     * as if they did is how local traffic shows up as somebody else's country.
     */
    private function isRoutable(?string $ip): bool
    {
        if ($ip === null || $ip === '') {
            return false;
        }

        if (in_array($ip, (array) config('analytics.internal_ips', []), true)) {
            return false;
        }

        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }

    /**
     * Opens the database at most once per process.
     *
     * Construction is not free: the reader stats the file, scans back from the
     * end for the metadata block and decodes it. With ext-maxminddb installed
     * the file is memory mapped instead and both construction and every lookup
     * get markedly cheaper, which matters because this runs inside the request.
     */
    private function reader(): ?Reader
    {
        if ($this->reader !== null) {
            return $this->reader;
        }

        if ($this->unavailable) {
            return null;
        }

        $path = $this->database ?? (string) config('analytics.geo_database');

        if (! is_readable($path)) {
            $this->unavailable = true;
            $this->notify($path);

            return null;
        }

        try {
            return $this->reader = new Reader($path);
        } catch (Throwable $e) {
            $this->unavailable = true;

            logger()->debug('Analytics geo database could not be opened.', ['reason' => $e->getMessage()]);

            return null;
        }
    }

    private function notify(string $path): void
    {
        if ($this->warned) {
            return;
        }

        $this->warned = true;

        logger()->debug('Analytics geolocation disabled: database missing.', [
            'path' => $path,
            'hint' => 'Place a GeoLite2-Country.mmdb there or set ANALYTICS_GEO=none.',
        ]);
    }
}
