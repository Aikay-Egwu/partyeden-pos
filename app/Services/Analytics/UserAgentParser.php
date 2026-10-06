<?php

namespace App\Services\Analytics;

/**
 * Deliberately small user agent parsing.
 *
 * A full UA-CLI/WhichBrowser dependency costs more than the answer is worth:
 * the dashboard only needs three buckets, and the raw user agent string is
 * something the privacy position of this system depends on never storing.
 * Anything unrecognised lands in "Other" rather than being guessed at.
 */
class UserAgentParser
{
    /**
     * @return array{browser: string|null, os: string|null, device_type: string|null}
     */
    public function parse(string $agent): array
    {
        return [
            'browser' => $this->browser($agent),
            'os' => $this->os($agent),
            'device_type' => $this->device($agent),
        ];
    }

    private function browser(string $agent): ?string
    {
        // Most specific first: Chromium based browsers all advertise "Chrome".
        return match (true) {
            (bool) preg_match('/Edg(?:e|A|iOS)?\//i', $agent) => 'Edge',
            (bool) preg_match('/OPR\/|Opera/i', $agent) => 'Opera',
            (bool) preg_match('/SamsungBrowser\//i', $agent) => 'Samsung Internet',
            (bool) preg_match('/CriOS\//i', $agent) => 'Chrome',
            (bool) preg_match('/Firefox\//i', $agent) => 'Firefox',
            (bool) preg_match('/Chrome\//i', $agent) => 'Chrome',
            (bool) preg_match('/Version\/.*Safari\//i', $agent) => 'Safari',
            default => null,
        };
    }

    private function os(string $agent): ?string
    {
        return match (true) {
            (bool) preg_match('/Windows NT/i', $agent) => 'Windows',
            (bool) preg_match('/iPhone|iPad|iPod/i', $agent) => 'iOS',
            (bool) preg_match('/Mac OS X|Macintosh/i', $agent) => 'macOS',
            (bool) preg_match('/Android/i', $agent) => 'Android',
            (bool) preg_match('/CrOS/i', $agent) => 'ChromeOS',
            (bool) preg_match('/Linux/i', $agent) => 'Linux',
            default => null,
        };
    }

    private function device(string $agent): string
    {
        // iPads report as Macintosh on iPadOS 13+, hence the desktop-mode check.
        if ((bool) preg_match('/iPad|iPhone|iPod/i', $agent)) {
            return 'mobile';
        }

        if ((bool) preg_match('/Macintosh.*Touch/i', $agent)) {
            return 'tablet';
        }

        if ((bool) preg_match('/Android(?!.*Mobile)/i', $agent)) {
            return 'tablet';
        }

        if ((bool) preg_match('/Mobile|Android|BlackBerry|IEMobile|Opera Mini/i', $agent)) {
            return 'mobile';
        }

        return 'desktop';
    }
}
