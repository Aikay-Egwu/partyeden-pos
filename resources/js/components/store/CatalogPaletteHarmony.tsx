import { cn } from '@/lib/utils';

export type PaletteSwatch = {
    name: string;
    colors: [string, string, string];
    /** For active: "Active Selection", otherwise item count e.g. "12 items" */
    meta: string;
    active?: boolean;
};

export type BundleIncludedItem = {
    label: string;
};

export type CatalogPaletteHarmonyProps = {
    eyebrowLabel?: string;
    heading?: string;
    copy?: string;
    viewAllLabel?: string;
    palettes?: PaletteSwatch[];
    /** Left-side banner eyebrow, e.g. "DESIGNER CURATED TRIO" */
    bannerEyebrow?: string;
    /** Banner big heading */
    bannerHeading?: string;
    /** Banner body copy */
    bannerCopy?: string;
    /** 3 checkmark-included items */
    includedItems?: BundleIncludedItem[];
    /** Current bundle price, e.g. "£68.00" */
    bundlePrice?: string;
    /** Strike-through RRP, e.g. "£82.50 RRP" */
    bundleRrp?: string;
    /** Purple CTA label, e.g. "Shop Complete Bundle" */
    bundleCtaLabel?: string;
    /** Array of 3 photo sources for the right-side photo cluster */
    bannerPhotos?: [string, string, string];
    /** 3 photo alts */
    bannerPhotoAlts?: [string, string, string];
    className?: string;
    id?: string;
};

const img = (name: string) => `/figma-img/${name}`;

const defaultPalettes: PaletteSwatch[] = [
    {
        name: 'Lavender & Gold',
        colors: ['#EADDFF', '#FDC425', '#630ED4'],
        meta: 'Active Selection',
        active: true,
    },
    {
        name: 'Royal & Lemon',
        colors: ['#630ED4', '#FDC425', '#201637'],
        meta: '12 items',
    },
    {
        name: 'Pastel Blush & Rose',
        colors: ['#FFD6D6', '#FF9AAF', '#FDC425'],
        meta: '15 items',
    },
    {
        name: 'Sand & Champagne',
        colors: ['#FDC425', '#630ED4', '#DDDDDD'],
        meta: '9 items',
    },
    {
        name: 'Fiesta Confetti',
        colors: ['#FF5E3D', '#FDC425', '#630ED4'],
        meta: '11 items',
    },
    {
        name: 'Midnight & Silver',
        colors: ['#19132C', '#351257', '#5A545F'],
        meta: '8 items',
    },
];

const defaultIncluded: BundleIncludedItem[] = [
    { label: '1x Personalised 24" Feather Bubble (£36.50 value)' },
    { label: '2x Mini Side Bouquets with Foil Stars (£24.00 value)' },
    { label: '1x 2.5m DIY Organic Arch Kit (£22.00 value)' },
];

const defaultPhotos: [string, string, string] = [
    img('mui8bfq9-9rq0qsz.png'),
    img('mui8bfq9-lpyf5bd.png'),
    img('mui8bfq9-x4cwrby.png'),
];

const defaultPhotoAlts: [string, string, string] = [
    'Lavender feather bubble centerpiece',
    'Honey gold mini side bouquet',
    'Lavender honey gold organic arch',
];

/**
 * 6 palette selector tabs matching Figma `.container95 .colorSwatchTabs` spec.
 * Each tab has 3 inline color swatch circles, palette name, and meta line.
 * Active (active = purple ring + drop shadow; the first "Active Selection" meta label below.
 */
function PaletteTab({
    palette,
    index,
}: {
    palette: PaletteSwatch;
    index: number;
}) {
    void index;

    return (
        <button
            type="button"
            className={cn(
                'inline-flex flex-col items-start gap-2 rounded-[32px] p-3 transition-all',
                palette.active
                    ? 'bg-white shadow-[0px_0px_0px_2px_#630ED4,0px_1px_2px_0px_#0000000d]'
                    : 'rounded-[32px] bg-white shadow-[0px_1px_2px_0px_#0000000d]',
            )}
        >
            <div className="flex shrink-0 items-center gap-1 self-stretch">
                {palette.colors.map((c, i) => (
                    <div
                        key={i}
                        className="h-5 w-5 shrink-0 rounded-full"
                        style={{ background: c }}
                    />
                ))}
            </div>
            <div className="flex shrink-0 flex-col items-start self-stretch">
                <span className="shrink-0 self-stretch text-xs leading-[15px] font-bold tracking-[0.24px] text-popjoy-ink">
                    {palette.name}
                </span>
                <span
                    className={cn(
                        'text-[11px] leading-[14px] tracking-[0.33px]',
                        palette.active
                            ? 'font-medium text-popjoy-purple'
                            : 'font-medium text-popjoy-muted',
                    )}
                >
                    {palette.meta}
                </span>
            </div>
        </button>
    );
}

/**
 * Celebration palette harmony section matching the Figma `.container95` spec:
 *
 * - Top block: "CELEBRATION CLUB" eyebrow label, the "PALETTE HARMONY" eyebrow,
 * "Shop by Celebration Palette" heading, 2-line body copy, and on the right a
 * purple "View all 14 seasonal palettes" link with a chevron arrow.
 *
 * 6 palette tabs in a single row (each with 3 color swatch circles + name + count/active label.
 *
 * Designer Curated Trio banner: rounded white card with lavender & honey gold theme
 * (left eyebrow + description + 3 checkmark included items + price/RRP + purple
 * "Shop Complete Bundle" CTA).
 * Right column: staggered cluster of 3 rounded-32 product photos.
 *
 * @example
 * <CatalogPaletteHarmony />
 */
export function CatalogPaletteHarmony({
    eyebrowLabel = 'CELEBRATION CLUB',
    heading = 'Shop by Celebration Palette',
    copy = 'Match your tableware, bridesmaid dresses, or party theme with our designer-coordinated latex and chrome foil color blends.',
    viewAllLabel = 'View all 14 seasonal palettes',
    palettes = defaultPalettes,
    bannerEyebrow = 'DESIGNER CURATED TRIO',
    bannerHeading = 'The Lavender & Honey Gold Suite',
    bannerCopy = 'Everything you need for an unforgettable entrance and cake display: 1x Tabletop Mini Bouquet, 1x Deco Bubble Centerpiece, and 1x 2-meter Demi Garland Arch.',
    includedItems = defaultIncluded,
    bundlePrice = '£68.00',
    bundleRrp = '£82.50 RRP',
    bundleCtaLabel = 'Shop Complete Bundle (Save £14.50)',
    bannerPhotos = defaultPhotos,
    bannerPhotoAlts = defaultPhotoAlts,
    className,
    id,
}: CatalogPaletteHarmonyProps) {
    void eyebrowLabel;
    const headingId = id ? `${id}-heading` : 'palette-harmony-heading';
    const sectionId = id ? `${id}-section` : 'palette-harmony-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start bg-popjoy-purple-bg px-10 py-16',
                className,
            )}
            style={{ rowGap: '24px' }}
        >
            <div className="flex shrink-0 items-end justify-between self-stretch">
                <div
                    className="inline-flex shrink-0 flex-col items-start pt-[6px]"
                    style={{ rowGap: '4px' }}
                >
                    <span className="shrink-0 font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                        PALETTE HARMONY
                    </span>
                    <h2
                        id={headingId}
                        className="shrink-0 self-stretch pt-[3px] font-plus-jakarta text-[32px] leading-10 font-bold tracking-[-0.64px] text-popjoy-ink"
                    >
                        {heading}
                    </h2>
                    <p className="max-w-[549px] shrink-0 self-stretch font-sans text-[15px] leading-[22px] text-popjoy-muted">
                        {copy}
                    </p>
                </div>
                <div className="inline-flex shrink-0 items-center gap-1">
                    <span className="text-sm leading-[18px] font-bold tracking-[0.14px] text-popjoy-purple">
                        {viewAllLabel}
                    </span>
                    <img
                        src={img('mui8bfpf-0odocd6.svg')}
                        alt=""
                        aria-hidden="true"
                        className="h-[12px] w-[11px] shrink-0"
                    />
                </div>
            </div>

            <div
                className="flex shrink-0 items-start self-stretch"
                style={{ columnGap: '12px' }}
            >
                {palettes.map((palette, idx) => (
                    <PaletteTab
                        key={`${palette.name}-${idx}`}
                        palette={palette}
                        index={idx}
                    />
                ))}
            </div>

            <div className="shrink-0 self-stretch">
                <div
                    className="relative shrink-0 self-stretch overflow-hidden rounded-[48px] bg-white"
                    style={{ height: '364px' }}
                >
                    <div
                        className="absolute inset-0 flex items-center justify-between rounded-[48px] bg-white p-6"
                        style={{
                            width: '100%',
                            height: '364px',
                            boxShadow: '0px 8px 24px -4px #630ED414',
                        }}
                    >
                        <div className="flex shrink-0 flex-col items-start">
                            <span className="shrink-0 self-stretch font-sans text-[11px] leading-[14px] font-bold tracking-[0.55px] text-popjoy-gold-ink uppercase">
                                {bannerEyebrow}
                            </span>
                            <h3 className="shrink-0 self-stretch pt-1 font-plus-jakarta text-[22px] leading-7 font-bold text-popjoy-ink">
                                {bannerHeading}
                            </h3>
                            <div className="shrink-0 flex-col items-start self-stretch pt-2 pb-4">
                                <p className="max-w-[466px] shrink-0 self-stretch font-sans text-[15px] leading-[22px] text-popjoy-muted">
                                    {bannerCopy}
                                </p>
                            </div>
                            <div
                                className="shrink-0 flex-col items-start self-stretch pb-4"
                                style={{ rowGap: '8px' }}
                            >
                                {includedItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex shrink-0 items-center self-stretch"
                                        style={{ columnGap: '8px' }}
                                    >
                                        <img
                                            src={img('mui8bfpf-76qmgge.svg')}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-4 w-4 shrink-0"
                                        />
                                        <span className="shrink-0 text-[13px] leading-[18px] text-popjoy-ink">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="flex shrink-0 flex-col items-start justify-center self-stretch"
                                style={{ rowGap: '12px' }}
                            >
                                <div
                                    className="flex shrink-0 items-start self-stretch"
                                    style={{ marginRight: '273px' }}
                                >
                                    <span className="font-plus-jakarta text-[32px] leading-10 font-extrabold tracking-[-0.64px] text-popjoy-purple">
                                        {bundlePrice}
                                    </span>
                                    <span className="mt-[22px] ml-[13px] text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted line-through">
                                        {bundleRrp}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex shrink-0 flex-col items-center justify-center self-stretch rounded-full bg-popjoy-purple-soft px-6 py-3"
                                    style={{
                                        marginRight: '160px',
                                        boxShadow: '0px 4px 16px 0px #630ED433',
                                    }}
                                >
                                    <span className="shrink-0 text-sm leading-[18px] font-bold tracking-[0.14px] text-white">
                                        {bundleCtaLabel}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex items-start pr-px"
                            style={{ height: '116px' }}
                        >
                            <div className="flex shrink-0 flex-col items-start justify-center overflow-hidden rounded-[32px] bg-popjoy-purple-bg shadow-[0px_1px_2px_0px_#0000000d]">
                                <img
                                    src={bannerPhotos[0]}
                                    alt={bannerPhotoAlts[0]}
                                    className="h-[116px] w-[213px] shrink-0 self-stretch overflow-hidden object-cover"
                                />
                            </div>
                            <div className="mt-[-8px] ml-3 flex shrink-0 flex-col items-start justify-center overflow-hidden rounded-[32px] bg-popjoy-purple-bg shadow-[0px_4px_6px_-1px_#0000001a,0px_2px_4px_-2px_#0000001a]">
                                <img
                                    src={bannerPhotos[1]}
                                    alt={bannerPhotoAlts[1]}
                                    className="h-[116px] w-[213px] shrink-0 self-stretch overflow-hidden object-cover"
                                />
                            </div>
                            <div className="ml-3 flex shrink-0 flex-col items-start justify-center overflow-hidden rounded-[32px] bg-popjoy-purple-bg shadow-[0px_1px_2px_0px_#0000000d]">
                                <img
                                    src={bannerPhotos[2]}
                                    alt={bannerPhotoAlts[2]}
                                    className="h-[116px] w-[213px] shrink-0 self-stretch overflow-hidden object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
