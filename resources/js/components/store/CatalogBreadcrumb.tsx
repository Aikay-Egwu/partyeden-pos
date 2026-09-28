import { cn } from '@/lib/utils';

/**
 * Breadcrumb segment with label and optional target href.
 */
export type CatalogBreadcrumbItem = {
    /** Display label for the breadcrumb step */
    label: string;
    /** Optional href for clickable breadcrumb segments */
    href?: string;
};

/**
 * Props for the CatalogBreadcrumb component.
 * Matches Figma `.container3` inside `.container114` top row:
 * a breadcrumb trail on the left and a gold informational pill on the right.
 */
export type CatalogBreadcrumbProps = {
    /**
     * Breadcrumb trail segments rendered left-to-right with chevron separators.
     * Falls back to Home > Shop Balloons > All Inflated Balloon Collections.
     */
    items?: CatalogBreadcrumbItem[];
    /** Gold pill text label */
    pillLabel?: string;
    /** Optional additional className for the outer container */
    className?: string;
    /** Optional id attribute for the section */
    id?: string;
};

const defaultItems: CatalogBreadcrumbItem[] = [
    { label: 'Home', href: '#' },
    { label: 'Shop Balloons', href: '#' },
    { label: 'All Inflated Balloon Collections' },
];

/**
 * Catalog breadcrumb bar matching the Figma `.container3` layout.
 *
 * LEFT: breadcrumb trail (Home > Shop Balloons > All Inflated Balloon Collections)
 *        separated by chevron icons.
 * RIGHT: gold pill with balloon icon and delivery/service message.
 *
 * Uses `role="section"` + `aria-labelledby` for accessible navigation context.
 *
 * @example
 * <CatalogBreadcrumb />
 */
export function CatalogBreadcrumb({
    items = defaultItems,
    pillLabel = 'Pre-inflated, weighted & boxed next-day across the UK',
    className,
    id,
}: CatalogBreadcrumbProps) {
    const headingId = `${id ?? 'catalog-breadcrumb'}-heading`;

    return (
        <section
            id={id}
            role="region"
            aria-labelledby={headingId}
            className={cn(
                'flex w-full items-center justify-between px-10 pt-4 pb-2',
                className,
            )}
        >
            <h2 id={headingId} className="sr-only">
                Page breadcrumb navigation
            </h2>

            <nav
                aria-label="Breadcrumb"
                className="inline-flex items-center gap-1"
            >
                {items.map((item, index) => (
                    <div
                        key={`${item.label}-${index}`}
                        className="inline-flex items-center gap-1"
                    >
                        {item.href ? (
                            <a
                                href={item.href}
                                className="font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-popjoy-muted hover:text-popjoy-purple-soft"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <span className="font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-popjoy-ink">
                                {item.label}
                            </span>
                        )}
                        {index < items.length - 1 && (
                            <img
                                src="/figma-img/mui8bfpc-y5r3urm.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-[7px] w-1 shrink-0"
                            />
                        )}
                    </div>
                ))}
            </nav>

            <div
                className="inline-flex items-center gap-1 rounded-full px-3 py-1"
                style={{ background: 'rgba(255, 223, 154, 0.5)' }}
            >
                <img
                    src="/figma-img/mui8bfpc-aod7kxb.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-[11px] w-[15px] shrink-0"
                />
                <span className="font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-[#251A00]">
                    {pillLabel}
                </span>
            </div>
        </section>
    );
}
