<?php

declare(strict_types=1);

namespace App\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Adds a dateRange scope to Eloquent models for filtering by date range.
 *
 * Usage: Model::dateRange($from, $to, 'created_at')
 */
trait FilterableByDateRange
{
    /**
     * Scope a query to filter by a date range on a given column.
     */
    public function scopeDateRange(Builder $query, ?string $from = null, ?string $to = null, string $column = 'created_at'): Builder
    {
        if ($from) {
            $query->whereDate($column, '>=', $from);
        }

        if ($to) {
            $query->whereDate($column, '<=', $to);
        }

        return $query;
    }
}
