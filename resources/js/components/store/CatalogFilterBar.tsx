import { cn } from '@/lib/utils';

/**
 * Top-row category pill. First pill (active) renders in popjoy-purple-soft;
 * the rest use a light purple `#F4EAFF` background.
 */
export type CatalogCategoryPill = {
    /** Label, may include count in parentheses e.g. "All (48)" */
    label: string;
    /** Whether this pill is the active/selected one */
    active?: boolean;
    /** Optional click handler */
    onClick?: () => void;
};

/**
 * Dropdown pill used on the bottom filter row.
 */
export type CatalogFilterDropdown = {
    /** Field prefix label, e.g. "Occasion" */
    field: string;
    /** Current selection value, e.g. "All Celebrations" */
    value: string;
};

/**
 * Current layout view mode: grid or list.
 */
export type CatalogViewMode = 'grid' | 'list';

/**
 * Props for the CatalogFilterBar component.
 * Matches Figma `.sectionStickyFilterR`: rounded-48 white card with shadow,
 * top row of category pills + "Showing N packages", bottom row with
 * 3 dropdowns (occasion/palette/budget) + longevity pill + sort + view toggle.
 */
export type CatalogFilterBarProps = {
    /**
     * Top-row category pills. First is expected to be active (All).
     * Defaults to All (48), Personalised Bubbles (14), Milestone Stacks (12),
     * Foil Clusters (9), DIY Garlands (8), Event Moongates (5).
     */
    categoryPills?: CatalogCategoryPill[];
    /** Count / summary text shown right of the pills (with a gold 8x8 dot) */
    resultsLabel?: string;
    /** Occasion dropdown field + value */
    occasion?: CatalogFilterDropdown;
    /** Palette/colorway dropdown field + value */
    palette?: CatalogFilterDropdown;
    /** Budget/price range dropdown field + value */
    budget?: CatalogFilterDropdown;
    /** Longevity guarantee pill label */
    longevityLabel?: string;
    /** Sort dropdown label + current value */
    sortLabel?: string;
    /** Active view: grid (default, selected) or list */
    viewMode?: CatalogViewMode;
    /** Fired when the user clicks the grid/list toggle */
    onViewModeChange?: (next: CatalogViewMode) => void;
    /** Optional additional className for the outer section wrapper */
    className?: string;
    /** Optional id attribute for the section */
    id?: string;
};

const defaultCategoryPills: CatalogCategoryPill[] = [
    { label: 'All (48)', active: true },
    { label: 'Personalised Bubbles (14)' },
    { label: 'Milestone Stacks (12)' },
    { label: 'Foil Clusters (9)' },
    { label: 'DIY Garlands (8)' },
    { label: 'Event Moongates (5)' },
];

/**
 * Sticky-style catalog filter bar matching Figma `.sectionStickyFilterR`.
 *
 * Container: rounded-48 white card with soft purple shadow, 16px padding.
 *
 * TOP ROW: 6 category pills (first active in popjoy-purple-soft / white text,
 * rest on `#F4EAFF`), right-aligned "Showing 48 celebration packages" with
 * 8x8 gold dot (#785A00).
 *
 * BOTTOM ROW (top border 1px solid `#F4EAFF`):
 *  LEFT: 3 rounded-9999 dropdown pills on `#F9F1FF` (Occasion / Palette / Budget)
 *        with chevron icons, plus the 10-14 Days Guaranteed Float longevity
 *        pill (gold balloon icon).
 *  RIGHT: "Sort by: Bestselling First" dropdown + grid/list toggle
 *        (grid active: white with shadow on popjoy-bg; list neutral).
 *
 * @example
 * <CatalogFilterBar resultsLabel="Showing 48 celebration packages" />
 */
export function CatalogFilterBar({
    categoryPills = defaultCategoryPills,
    resultsLabel = 'Showing 48 celebration packages',
    occasion = { field: 'Occasion', value: 'All Celebrations' },
    palette = { field: 'Palette', value: 'All Colorways' },
    budget = { field: 'Budget', value: 'Any Price' },
    longevityLabel = '10-14 Days Guaranteed Float',
    sortLabel = 'Sort by: Bestselling First',
    viewMode = 'grid',
    onViewModeChange,
    className,
    id,
}: CatalogFilterBarProps) {
    const headingId = `${id ?? 'catalog-filter'}-heading`;

    return (
        <section
            id={id}
            role="region"
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start self-stretch px-10 pt-4',
                className,
            )}
            style={{ maxWidth: '1280px' }}
        >
            <h2 id={headingId} className="sr-only">
                Catalog filters and sorting
            </h2>

            <div className="flex w-full shrink-0 items-center self-stretch rounded-[48px] bg-white">
                <div
                    className="flex w-full flex-1 flex-col items-center rounded-[48px] p-4"
                    style={{
                        boxShadow: '0 4px 20px -2px rgba(99, 14, 212, 0.06)',
                        background: 'rgba(255, 255, 255, 0.004)',
                    }}
                >
                    <div className="flex w-[1168px] items-start overflow-auto pb-1">
                        <div className="inline-flex items-center gap-1">
                            {categoryPills.map((pill, index) => (
                                <button
                                    key={`${pill.label}-${index}`}
                                    type="button"
                                    onClick={pill.onClick}
                                    className={cn(
                                        'inline-flex flex-shrink-0 flex-col items-center justify-center rounded-full px-4 py-1',
                                        pill.active
                                            ? 'bg-popjoy-purple-soft'
                                            : 'bg-[#F4EAFF]',
                                    )}
                                    style={
                                        pill.active
                                            ? {
                                                  boxShadow:
                                                      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                              }
                                            : undefined
                                    }
                                >
                                    <span
                                        className={cn(
                                            'font-sans text-sm leading-[18px] font-semibold tracking-[0.14px]',
                                            pill.active
                                                ? 'text-white'
                                                : 'text-popjoy-ink',
                                        )}
                                    >
                                        {pill.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-[5px] ml-3 inline-flex items-center gap-1">
                            <div
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: '#785A00' }}
                            />
                            <span className="font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-popjoy-muted">
                                {resultsLabel}
                            </span>
                        </div>
                    </div>

                    <div
                        className="mt-3 flex w-full flex-col items-start justify-center self-stretch border-t pt-[7px]"
                        style={{
                            borderColor: '#F4EAFF',
                            rowGap: '12px',
                        }}
                    >
                        <div className="flex w-full items-end justify-between">
                            <div className="inline-flex shrink-0 items-center gap-2 self-stretch">
                                <div className="flex shrink-0 items-start pt-0.5">
                                    <div className="relative inline-flex flex-1 items-center rounded-full bg-popjoy-purple-bg py-1 pr-6 pl-3">
                                        <span className="shrink-0 pr-2 font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-popjoy-ink">
                                            {occasion.field}: {occasion.value}
                                        </span>
                                        <img
                                            src="/figma-img/mui8bfpc-adkweuq.svg"
                                            alt=""
                                            aria-hidden="true"
                                            className="absolute top-[3px] right-[10px] h-4 w-2 shrink-0"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-start pt-0.5">
                                    <div className="relative inline-flex flex-1 items-center rounded-full bg-popjoy-purple-bg py-1 pr-6 pl-3">
                                        <span className="shrink-0 pr-[37px] font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-popjoy-ink">
                                            {palette.field}: {palette.value}
                                        </span>
                                        <img
                                            src="/figma-img/mui8bfpc-adkweuq.svg"
                                            alt=""
                                            aria-hidden="true"
                                            className="absolute top-[3px] right-[10px] h-4 w-2 shrink-0"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-start pt-0.5">
                                    <div className="relative inline-flex flex-1 items-center rounded-full bg-popjoy-purple-bg py-1 pr-6 pl-3">
                                        <span className="shrink-0 pr-[113px] font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-popjoy-ink">
                                            {budget.field}: {budget.value}
                                        </span>
                                        <img
                                            src="/figma-img/mui8bfpc-adkweuq.svg"
                                            alt=""
                                            aria-hidden="true"
                                            className="absolute top-[3px] right-[10px] h-4 w-2 shrink-0"
                                        />
                                    </div>
                                </div>

                                <div
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1"
                                    style={{ background: '#F4EAFF' }}
                                >
                                    <img
                                        src="/figma-img/mui8bfpc-0l8hc6t.svg"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-3 w-[13px] shrink-0"
                                    />
                                    <span className="font-sans text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-purple">
                                        {longevityLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="inline-flex shrink-0 items-center justify-center gap-3">
                                <div className="flex shrink-0 items-start pt-0.5">
                                    <div className="relative inline-flex flex-1 items-center rounded-full bg-popjoy-purple-bg py-1 pr-6 pl-3">
                                        <span className="shrink-0 pr-[11px] font-sans text-xs leading-4 font-bold tracking-[0.24px] text-popjoy-ink">
                                            {sortLabel}
                                        </span>
                                        <img
                                            src="/figma-img/mui8bfpc-adkweuq.svg"
                                            alt=""
                                            aria-hidden="true"
                                            className="absolute top-[3px] right-[10px] h-4 w-2 shrink-0"
                                        />
                                    </div>
                                </div>

                                <div
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full p-1"
                                    style={{ background: '#F9F1FF' }}
                                >
                                    <button
                                        type="button"
                                        aria-pressed={viewMode === 'grid'}
                                        onClick={() =>
                                            onViewModeChange?.('grid')
                                        }
                                        className={cn(
                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                            viewMode === 'grid'
                                                ? 'bg-white'
                                                : '',
                                        )}
                                        style={
                                            viewMode === 'grid'
                                                ? {
                                                      boxShadow:
                                                          '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                  }
                                                : undefined
                                        }
                                    >
                                        <img
                                            src="/figma-img/mui8bfpc-4r1hujy.svg"
                                            alt="Grid view"
                                            aria-hidden={viewMode !== 'grid'}
                                            className="h-[14px] w-[14px]"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        aria-pressed={viewMode === 'list'}
                                        onClick={() =>
                                            onViewModeChange?.('list')
                                        }
                                        className={cn(
                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                            viewMode === 'list'
                                                ? 'bg-white'
                                                : '',
                                        )}
                                        style={
                                            viewMode === 'list'
                                                ? {
                                                      boxShadow:
                                                          '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                  }
                                                : undefined
                                        }
                                    >
                                        <img
                                            src="/figma-img/mui8bfpc-1og1ads.svg"
                                            alt="List view"
                                            aria-hidden={viewMode !== 'list'}
                                            className="h-3 w-[15px]"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
