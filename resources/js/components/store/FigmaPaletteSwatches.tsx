import { cn } from '@/lib/utils';

/**
 * Single celebration palette swatch definition.
 * Each palette is shown as two overlapping circular color swatches (primary + secondary),
 * with a name label and a secondary info line (Boutique Pick / Sets count).
 */
export type FigmaPaletteSwatch = {
    /** Palette display name, e.g. "Royal & Lemon" */
    name: string;
    /** Secondary info line: "Boutique Pick" or "X Sets" */
    meta: string;
    /** Primary (back) circle color hex */
    primaryColor: string;
    /** Secondary (front, offset) circle color hex */
    secondaryColor: string;
    /** Optional border color for the swatch circles */
    borderColor?: string;
    /** Whether this palette is the active/selected one */
    active?: boolean;
};

/**
 * Props for the FigmaPaletteSwatches component.
 * Matches Figma `.container59`: EFFORTLESS EVENT STYLING eyebrow,
 * "Shop By Celebration Palette" heading, 6 circular dual-color swatches,
 * combo showcase banner with Royal & Lemon theme preview image,
 * and a gold "Order Full Theme Bundle (£89.00)" CTA button.
 */
export type FigmaPaletteSwatchesProps = {
    /** Optional array of 6 palette swatches. Falls back to the default Party Eden palettes. */
    swatches?: FigmaPaletteSwatch[];
    /** Active theme name shown in the combo banner */
    activeThemeName?: string;
    /** Active theme description shown in the combo banner */
    activeThemeDescription?: string;
    /** Combo banner showcase image source */
    showcaseImageSrc?: string;
    /** Bundle price shown on the CTA button, e.g. "£89.00" */
    bundlePrice?: string;
    /** Optional additional className for the section container */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultSwatches: FigmaPaletteSwatch[] = [
    {
        name: 'Royal & Lemon',
        meta: 'Boutique Pick',
        primaryColor: '#630ed4',
        secondaryColor: '#fdc425',
        active: true,
    },
    {
        name: 'Lavender & Gold',
        meta: '18 Sets',
        primaryColor: '#7c3aed',
        secondaryColor: '#fdc425',
    },
    {
        name: 'Pastel Blush',
        meta: '24 Sets',
        primaryColor: '#f9a8d4',
        secondaryColor: '#fce7f3',
    },
    {
        name: 'Sand & Champagne',
        meta: '15 Sets',
        primaryColor: '#d4a574',
        secondaryColor: '#f5e6d3',
    },
    {
        name: 'Rainbow Fiesta',
        meta: '32 Sets',
        primaryColor: '#ef4444',
        secondaryColor: '#22c55e',
    },
    {
        name: 'Midnight & Silver',
        meta: '12 Sets',
        primaryColor: '#201637',
        secondaryColor: '#c0c0c0',
    },
];

/**
 * Celebration palette selector matching the Figma `.container59` + `.swatchSelectors` spec.
 * Header block: eyebrow, heading, and 2-line description.
 * 6 clickable swatch buttons in a single row, each rendering two overlapping circles
 * (primary color behind, secondary color offset top-right) with name and meta label.
 * Combo showcase banner with the active theme preview image, active theme details,
 * and a rounded gold "Order Full Theme Bundle (£X)" CTA pill.
 *
 * @example
 * <FigmaPaletteSwatches />
 */
export function FigmaPaletteSwatches({
    swatches = defaultSwatches,
    activeThemeName = 'Active Theme: Royal Purple & Sunny Lemon',
    activeThemeDescription = 'Includes: 2x Jumbo numbers, 1x custom bubble, 2x ceiling bunches, and matching table confetti.',
    showcaseImageSrc = '/figma-img/muhjqsol-rk05l72.png',
    bundlePrice = '£89.00',
    className,
    id,
}: FigmaPaletteSwatchesProps) {
    const headingId = id ? `${id}-heading` : 'palette-heading';
    const sectionId = id ? `${id}-section` : 'palette-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start gap-8 bg-white px-4 py-12 sm:px-6 sm:gap-10 sm:py-16 lg:px-8',
                className,
            )}
        >
            {/* Header block */}
            <div className="flex shrink-0 flex-col items-start gap-3 self-stretch">
                <span className="font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                    EFFORTLESS EVENT STYLING
                </span>
                <h2
                    id={headingId}
                    className="font-plus-jakarta leading-tight font-bold text-popjoy-ink"
                    style={{
                        fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
                        lineHeight: 1.27,
                    }}
                >
                    Shop By Celebration Palette
                </h2>
                <p className="max-w-[860px] font-sans text-sm leading-6 text-popjoy-muted">
                    Select your party mood. Our balloon stylists have curated
                    matching balloon bunches, numbers, and tableware in perfect
                    harmony.
                </p>
            </div>

            {/* 6 swatches row: grid 2/3/6 cols with wrapping */}
            <div className="grid w-full shrink-0 grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 self-stretch">
                {swatches.map((swatch, index) => (
                    <button
                        key={`${swatch.name}-${index}`}
                        type="button"
                        className={cn(
                            'flex w-full flex-col items-center gap-3 rounded-2xl p-3 transition-all sm:p-4',
                            swatch.active
                                ? 'border-2 border-popjoy-purple-surface bg-popjoy-purple-bg shadow-[0px_4px_12px_-2px_rgba(99,14,212,0.15)]'
                                : 'border-2 border-transparent hover:bg-popjoy-purple-bg/50',
                        )}
                    >
                        {/* Dual overlapping circles */}
                        <div className="relative h-[72px] w-[72px] shrink-0">
                            {/* Primary (back) circle */}
                            <div
                                className="absolute bottom-0 left-0 h-[56px] w-[56px] rounded-full border-2 border-white shadow-md"
                                style={{
                                    backgroundColor: swatch.primaryColor,
                                    borderColor:
                                        swatch.borderColor ?? '#ffffff',
                                }}
                            />
                            {/* Secondary (front, offset) circle */}
                            <div
                                className="absolute top-0 right-0 h-[56px] w-[56px] rounded-full border-2 border-white shadow-md"
                                style={{
                                    backgroundColor: swatch.secondaryColor,
                                    borderColor:
                                        swatch.borderColor ?? '#ffffff',
                                }}
                            />
                        </div>
                        {/* Name + meta */}
                        <div className="flex flex-col items-center gap-0.5 text-center">
                            <span className="font-plus-jakarta text-sm leading-5 font-bold text-popjoy-ink">
                                {swatch.name}
                            </span>
                            <span
                                className={cn(
                                    'font-sans text-xs leading-4',
                                    swatch.meta === 'Boutique Pick'
                                        ? 'font-bold text-popjoy-purple'
                                        : 'font-medium text-popjoy-muted',
                                )}
                            >
                                {swatch.meta}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Combo showcase banner + CTA: stack on mobile, row on md+ */}
            <div className="flex w-full shrink-0 flex-col items-stretch justify-between gap-5 rounded-3xl border border-popjoy-gold-border bg-popjoy-gold/15 p-5 sm:p-6 md:flex-row md:items-center md:gap-6 self-stretch">
                <div className="flex flex-1 shrink-0 flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                    {/* Theme preview image */}
                    <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-popjoy-purple-bg shadow-lg self-start">
                        <img
                            src={showcaseImageSrc}
                            alt="Royal Purple and Sunny Lemon theme preview"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    {/* Theme name + description */}
                    <div className="flex flex-1 flex-col items-start gap-2">
                        <span className="font-plus-jakarta text-sm leading-5 font-bold text-popjoy-gold-ink">
                            {activeThemeName}
                        </span>
                        <p className="font-sans text-xs leading-5 text-popjoy-muted">
                            {activeThemeDescription}
                        </p>
                    </div>
                </div>

                {/* Gold CTA pill */}
                <button
                    type="button"
                    className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-popjoy-gold px-6 py-3 shadow-[0px_4px_12px_-2px_rgba(253,196,37,0.45)] transition-opacity hover:opacity-90 sm:w-auto"
                >
                    <span className="font-plus-jakarta text-sm leading-5 font-bold tracking-[0.35px] text-popjoy-gold-ink">
                        Order Full Theme Bundle ({bundlePrice})
                    </span>
                </button>
            </div>
        </section>
    );
}
