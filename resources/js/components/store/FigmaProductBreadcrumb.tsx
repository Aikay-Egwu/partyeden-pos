import { cn } from '@/lib/utils';

/**
 * Single breadcrumb crumb link shown in the product breadcrumb trail.
 */
export type FigmaProductCrumb = {
    /** Display label for the crumb */
    label: string;
    /** Optional href; when omitted the crumb renders as plain text (typically the active page) */
    href?: string;
};

/**
 * Props for the FigmaProductBreadcrumb component.
 * Matches Figma `.container2` inside `.container89`: breadcrumb navigation
 * on a lilac background strip plus the red "High Demand" countdown pill on the right.
 */
export type FigmaProductBreadcrumbProps = {
    /** Breadcrumb crumb chain shown left-to-right (home → category → product) */
    crumbs?: FigmaProductCrumb[];
    /** Active page label displayed in bold under the chain (product name) */
    activeLabel?: string;
    /** Countdown demand text in the red warning pill */
    demandText?: string;
    /** Optional additional className for the outer strip */
    className?: string;
    /** Optional id attribute for the outer strip */
    id?: string;
};

const defaultCrumbs: FigmaProductCrumb[] = [
    { label: 'Home', href: '#' },
    { label: 'Personalised Balloons', href: '#' },
    { label: 'Bespoke Bubble Balloons', href: '#' },
];

/**
 * Top strip under the global header: breadcrumb trail for the active product
 * and a red high-demand pill signalling recent dispatch activity.
 *
 * Renders on a soft lilac bar matching Figma `.container2` (40px padded, #f9f1ff).
 *
 * @example
 * <FigmaProductBreadcrumb
 *   crumbs={[{ label: 'Home', href: '/' }, { label: 'Balloons' }]}
 *   activeLabel="Bespoke Feather Bubble"
 *   demandText="12 dispatched in the last 2 hours"
 * />
 */
export function FigmaProductBreadcrumb({
    crumbs = defaultCrumbs,
    activeLabel = 'Bespoke Feather & Confetti Luxury Bubble',
    demandText = 'High Demand: 14 personalised balloons dispatched in the last 3 hours for this weekend',
    className,
    id,
}: FigmaProductBreadcrumbProps) {
    return (
        <div
            id={id}
            className={cn(
                'flex w-full items-center justify-between bg-popjoy-purple-bg px-10 py-3',
                className,
            )}
            style={{ maxWidth: '1280px' }}
            role="navigation"
            aria-label="Breadcrumb"
        >
            {/* Breadcrumb chain + active label */}
            <div className="flex w-[626px] items-start justify-between pr-[265px]">
                <div className="flex flex-col items-start self-stretch">
                    <div className="flex items-center justify-between self-stretch">
                        {crumbs.map((crumb, index) => (
                            <span
                                key={`${crumb.label}-${index}`}
                                className="flex items-center"
                            >
                                {crumb.href ? (
                                    <a
                                        href={crumb.href}
                                        className="text-[13px] leading-[18px] text-popjoy-muted hover:opacity-80"
                                    >
                                        {crumb.label}
                                    </a>
                                ) : (
                                    <span className="text-[13px] leading-[18px] text-popjoy-muted">
                                        {crumb.label}
                                    </span>
                                )}
                                {index < crumbs.length - 1 && (
                                    <span className="mx-2 text-[13px] leading-[18px] text-popjoy-muted-light">
                                        /
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                    <p className="mt-1 text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                        {activeLabel}
                    </p>
                </div>
                <span className="text-[13px] leading-[18px] text-popjoy-muted-light">
                    /
                </span>
            </div>

            {/* High demand red pill */}
            <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ffdad6] px-4 py-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#ba1a1a]" />
                <div className="inline-flex flex-col items-start pr-[54px]">
                    <p className="shrink-0 text-[12px] leading-[16px] font-medium tracking-[0.24px] text-[#93000a]">
                        {demandText.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                {i < demandText.split('\n').length - 1 && (
                                    <br />
                                )}
                            </span>
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
}
