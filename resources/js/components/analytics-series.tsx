import { useId, useMemo, useState } from 'react';

import type { AnalyticsPoint } from '@/types/analytics';

type Metric = 'views' | 'visitors';

const WIDTH = 960;
const HEIGHT = 200;
const PAD = { top: 12, right: 8, bottom: 22, left: 8 };

/**
 * A hand-rolled SVG chart instead of a charting dependency.
 *
 * Two numbers across at most 365 days does not justify 40-100 KB of d3 in an
 * admin bundle. The axes are deliberately absent: the tooltip and the totals
 * above it carry the values, and gridlines would be the only ink on the page.
 */
export default function AnalyticsSeries({
    points,
}: {
    points: AnalyticsPoint[];
}) {
    const gradientId = useId();
    const [metric, setMetric] = useState<Metric>('views');

    // Geometry and the two paths are derived together so the invisible hit
    // rectangles below stay aligned with the plotted points. Recomputing the
    // step separately is how a chart silently drifts off its own tooltips.
    const { line, area, peak, step, innerHeight } = useMemo(() => {
        const values = points.map((point) => point[metric]);
        const highest = Math.max(...values, 1);
        const plotWidth = WIDTH - PAD.left - PAD.right;
        const plotHeight = HEIGHT - PAD.top - PAD.bottom;
        const stride =
            points.length > 1 ? plotWidth / (points.length - 1) : plotWidth;

        const coords = values.map((value, index) => [
            PAD.left + index * stride,
            PAD.top + plotHeight - (value / highest) * plotHeight,
        ]);

        const path = coords
            .map(
                ([x, y], index) =>
                    `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`,
            )
            .join(' ');

        const base = PAD.top + plotHeight;

        return {
            line: path,
            area: coords.length
                ? `${path} L${coords[coords.length - 1][0].toFixed(1)},${base} L${coords[0][0].toFixed(1)},${base} Z`
                : '',
            peak: highest,
            step: stride,
            innerHeight: plotHeight,
        };
    }, [points, metric]);

    const empty = points.every((point) => point[metric] === 0);
    const first = points[0]?.label;
    const last = points[points.length - 1]?.label;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {metric === 'views' ? 'Page views' : 'Unique visitors'} per
                    day · peak {peak.toLocaleString()}
                </p>
                <div className="flex gap-1">
                    {(['views', 'visitors'] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setMetric(option)}
                            className={`rounded-md px-2.5 py-1 text-xs capitalize transition-colors ${
                                metric === option
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {option === 'views' ? 'Views' : 'Visitors'}
                        </button>
                    ))}
                </div>
            </div>

            {empty ? (
                <p className="flex h-50 items-center justify-center text-sm text-muted-foreground">
                    No data for this period yet.
                </p>
            ) : (
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="none"
                    className="h-50 w-full text-primary"
                    role="img"
                    aria-label={`${metric === 'views' ? 'Page views' : 'Unique visitors'} per day from ${first} to ${last}, peak ${peak}`}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="currentColor"
                                stopOpacity="0.28"
                            />
                            <stop
                                offset="100%"
                                stopColor="currentColor"
                                stopOpacity="0.02"
                            />
                        </linearGradient>
                    </defs>

                    <path d={area} fill={`url(#${gradientId})`} />
                    <path
                        d={line}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Invisible hit areas: the browser supplies the tooltip, so
                        there is no hover state to manage in JS. */}
                    {points.map((point, index) => (
                        <rect
                            key={point.date}
                            x={PAD.left + index * step - step / 2}
                            y={PAD.top}
                            width={Math.max(step, 2)}
                            height={innerHeight}
                            fill="transparent"
                        >
                            <title>{`${point.label}: ${point[metric].toLocaleString()} ${metric}`}</title>
                        </rect>
                    ))}
                </svg>
            )}

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{first}</span>
                <span>{last}</span>
            </div>
        </div>
    );
}
