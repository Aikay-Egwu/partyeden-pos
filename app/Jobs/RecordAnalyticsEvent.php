<?php

namespace App\Jobs;

use App\Services\Analytics\AnalyticsAggregator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

/**
 * Persists one already-captured page view.
 *
 * Dispatched on the "deferred" connection by default, which means it runs after
 * the response has been flushed to the visitor (see InvokeDeferredCallbacks) and
 * therefore needs no queue worker on the current single-server deploy. Flipping
 * ANALYTICS_QUEUE_CONNECTION to "database" or "redis" moves the same job onto a
 * real worker without anything else changing.
 */
class RecordAnalyticsEvent implements ShouldQueue
{
    use Queueable;

    /**
     * Telemetry is disposable. Retrying it means a database outage turns into a
     * backlog that replays hours of "today's" traffic once connectivity returns.
     */
    public int $tries = 1;

    public int $timeout = 5;

    /**
     * @param  array<string, mixed>  $event
     */
    public function __construct(public array $event) {}

    public function handle(AnalyticsAggregator $aggregator): void
    {
        $aggregator->ingest($this->event);
    }

    public function failed(Throwable $exception): void
    {
        // Never log the payload: it is the one place a future contributor could
        // accidentally reintroduce an address or a query string into the logs.
        logger()->debug('Analytics event dropped.', ['reason' => $exception->getMessage()]);
    }
}
