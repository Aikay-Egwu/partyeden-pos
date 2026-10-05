export interface AnalyticsLabelCount {
    label: string;
    views: number;
}

export interface AnalyticsCountry {
    label: string;
    visitors: number;
}

export interface AnalyticsPageRow {
    path: string;
    views: number;
    visitors: number;
}

export interface AnalyticsPoint {
    /** ISO date; the stable key for the point. */
    date: string;
    /** Pre-formatted day label, e.g. "17 Sep". */
    label: string;
    views: number;
    visitors: number;
}

export interface AnalyticsTotals {
    views: number;
    visitors: number;
    /** null when new/returning tracking is switched off. */
    new_visitors: number | null;
    views_per_visitor: number;
    countries: AnalyticsCountry[];
}

export interface AnalyticsProps {
    period: number;
    periods: number[];
    /** Pre-formatted display dates, e.g. "17 Sep 2026". */
    range: { from: string; to: string };
    totals: AnalyticsTotals;
    previous: AnalyticsTotals;
    series: AnalyticsPoint[];
    topPages: AnalyticsPageRow[];
    countries: AnalyticsCountry[];
    referrers: AnalyticsLabelCount[];
    devices: AnalyticsLabelCount[];
    browsers: AnalyticsLabelCount[];
    /**
     * First date the breakdowns can cover, or null when raw events are not
     * stored. Breakdowns cannot reach further back than the raw retention
     * window, so the period may be longer than the data behind them.
     */
    breakdownsFrom: string | null;
    /** View count over exactly the breakdown window: their percentage base. */
    breakdownViews: number;
    /** Pre-formatted server time the cached report was generated. */
    generatedAt: string;
}
