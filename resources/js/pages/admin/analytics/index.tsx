import { Head, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useMemo } from 'react';

import AnalyticsSeries from '@/components/analytics-series';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admin from '@/routes/admin';
import type {
    AnalyticsCountry,
    AnalyticsLabelCount,
    AnalyticsProps,
} from '@/types/analytics';

/**
 * Intl.DisplayNames resolves an ISO code to a country name with no lookup
 * table and no dependency. It throws on a malformed region code, which is why
 * the fallback is a catch rather than a guard.
 */
const regionNames =
    typeof Intl !== 'undefined' && 'DisplayNames' in Intl
        ? new Intl.DisplayNames(['en'], { type: 'region' })
        : null;

function countryName(code: string): string {
    try {
        return regionNames?.of(code) ?? code;
    } catch {
        return code;
    }
}

function percentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
}

function delta(current: number, previous: number): number | null {
    if (previous === 0) {
        return null;
    }

    return Math.round(((current - previous) / previous) * 100);
}

function StatCard({
    title,
    value,
    change,
    suffix,
}: {
    title: string;
    value: string;
    change?: number | null;
    suffix?: string;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums">
                        {value}
                    </span>
                    {typeof change === 'number' && (
                        <span
                            className={`flex items-center gap-0.5 text-xs ${
                                change >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                            {change >= 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3" />
                            )}
                            {Math.abs(change)}%
                        </span>
                    )}
                    {suffix && (
                        <span className="text-xs text-muted-foreground">
                            {suffix}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ShareBars({
    rows,
    total,
    emptyLabel,
}: {
    rows: (AnalyticsLabelCount | AnalyticsCountry)[];
    total: number;
    emptyLabel: string;
}) {
    if (rows.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                {emptyLabel}
            </p>
        );
    }

    const peak = Math.max(
        ...rows.map((row) => ('views' in row ? row.views : row.visitors)),
        1,
    );

    return (
        <ul className="flex flex-col gap-3">
            {rows.map((row) => {
                const count = 'views' in row ? row.views : row.visitors;

                return (
                    <li key={row.label} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="truncate">{row.label}</span>
                            <span className="text-muted-foreground tabular-nums">
                                {count.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary/80"
                                style={{ width: `${percentage(count, peak)}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {percentage(count, total)}% of total
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

export default function Analytics({
    period,
    periods,
    range,
    totals,
    previous,
    series,
    topPages,
    countries,
    referrers,
    devices,
    browsers,
    breakdownsFrom,
    breakdownViews,
    generatedAt,
}: AnalyticsProps) {
    const countryRows = useMemo(
        () =>
            countries.map((row) => ({
                label: `${countryName(row.label)} (${row.label})`,
                visitors: row.visitors,
            })),
        [countries],
    );

    const handlePeriodChange = (value: string) => {
        router.get(
            admin.analytics.index().url,
            { period: value },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Analytics" />
            {/* AdminLayout is applied automatically to every admin/* page, so
                this page renders bare content like the other admin screens. */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="text-sm text-muted-foreground">
                            {range.from} to {range.to} · no cookies, no
                            JavaScript, no third parties
                        </p>
                        {/* Reports are cached for five minutes, so the figures
                            can lag behind the latest page view. Saying when they
                            were built stops that reading as missing data. */}
                        <p className="text-xs text-muted-foreground">
                            Updated {generatedAt}
                        </p>
                    </div>
                    <Select
                        value={String(period)}
                        onValueChange={handlePeriodChange}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Last 30 days" />
                        </SelectTrigger>
                        <SelectContent>
                            {periods.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    Last {option} days
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Unique visitors"
                        value={totals.visitors.toLocaleString()}
                        change={delta(totals.visitors, previous.visitors)}
                    />
                    <StatCard
                        title="Page views"
                        value={totals.views.toLocaleString()}
                        change={delta(totals.views, previous.views)}
                    />
                    <StatCard
                        title="Views per visitor"
                        value={totals.views_per_visitor.toFixed(2)}
                        change={delta(
                            totals.views_per_visitor,
                            previous.views_per_visitor,
                        )}
                    />
                    <StatCard
                        title="New visitors"
                        value={
                            totals.new_visitors === null
                                ? 'Not measured'
                                : totals.new_visitors.toLocaleString()
                        }
                        suffix={
                            totals.new_visitors === null
                                ? undefined
                                : `of ${totals.visitors.toLocaleString()}`
                        }
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Traffic over time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnalyticsSeries points={series} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Where visitors come from</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ShareBars
                                rows={countryRows}
                                total={totals.visitors}
                                emptyLabel="No country data yet. Run php artisan analytics:geo-check to see why."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top pages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Page</TableHead>
                                        <TableHead className="text-right">
                                            Views
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Visitors
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topPages.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center text-muted-foreground"
                                            >
                                                No page views recorded yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {topPages.map((page) => (
                                        <TableRow key={page.path}>
                                            <TableCell className="max-w-[240px] truncate font-mono text-xs">
                                                {page.path}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {page.views.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {page.visitors.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Referrers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Percentages are taken against the views in the
                                breakdown window, not the headline total, which
                                can cover a longer period than raw events do. */}
                            <ShareBars
                                rows={referrers.map((row) => ({
                                    label:
                                        row.label === 'direct'
                                            ? 'Direct / none'
                                            : row.label,
                                    views: row.views,
                                }))}
                                total={breakdownViews}
                                emptyLabel="Referrers are read from raw events, which are kept for a limited window."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Devices &amp; browsers</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Device</p>
                                <ShareBars
                                    rows={devices}
                                    total={breakdownViews}
                                    emptyLabel="No data."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Browser</p>
                                <ShareBars
                                    rows={browsers}
                                    total={breakdownViews}
                                    emptyLabel="No data."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <p className="pb-4 text-xs text-muted-foreground">
                    Visitors are counted from a rotating salted hash of the
                    connection address, so a visitor is never followed across
                    days. Country is resolved locally from a geolocation
                    database at request time and stored as a two letter code
                    only — addresses and query strings are never written to the
                    database. Breakdowns
                    {breakdownsFrom
                        ? ` cover data since ${breakdownsFrom}.`
                        : ' are disabled while raw event storage is off.'}
                </p>
            </div>
        </>
    );
}
