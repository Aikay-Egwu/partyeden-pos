<?php

namespace App\Http\Middleware;

use App\Services\Analytics\AnalyticsRecorder;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Captures page views during the request and writes them after the response.
 *
 * Because Inertia navigations are genuine server requests (X-Inertia on the
 * wire, vary: X-Inertia on the way back), this single hook sees hard loads and
 * client-side route changes alike. That is what makes the whole system work
 * without a line of tracking JavaScript, a cookie, or a consent banner.
 *
 * AnalyticsRecorder is bound as a singleton for a reason: the kernel resolves
 * terminable middleware through the container again at terminate() time, so a
 * per-request instance would arrive with an empty buffer.
 */
class RecordPageView
{
    public function __construct(private readonly AnalyticsRecorder $recorder) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->recorder->capture($request);

        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $this->recorder->flush($request, $response);
    }
}
