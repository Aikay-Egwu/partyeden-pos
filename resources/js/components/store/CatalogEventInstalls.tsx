import { cn } from '@/lib/utils';

/**
 * Props for the CatalogEventInstalls component.
 * Matches Figma `.sectionLargeEventIns` spec:
 * dark gradient rounded-48 card with decorative purple blur blob,
 * left column (eyebrow pill, h2, copy, 3 stats, 2 buttons),
 * right column (venue photo with glass overlay caption).
 */
export type CatalogEventInstallsProps = {
    /** Gold celebration icon inside the eyebrow pill */
    eyebrowIconSrc?: string;
    /** Eyebrow pill text */
    eyebrowText?: string;
    /** Main headline h2 text */
    headline?: string;
    /** Supporting description paragraph */
    description?: string;
    /** Stat 1 large number label */
    stat1Number?: string;
    /** Stat 1 small label */
    stat1Label?: string;
    /** Stat 2 large number label */
    stat2Number?: string;
    /** Stat 2 small label */
    stat2Label?: string;
    /** Stat 3 large number label */
    stat3Number?: string;
    /** Stat 3 small label */
    stat3Label?: string;
    /** Primary CTA label */
    ctaLabel?: string;
    /** Secondary portfolio link label */
    portfolioLabel?: string;
    /** Portfolio link arrow icon */
    arrowIconSrc?: string;
    /** Venue hero photo src */
    venueImageSrc?: string;
    /** Venue photo alt text */
    venueImageAlt?: string;
    /** Camera icon inside the glass overlay caption */
    cameraIconSrc?: string;
    /** Glass overlay caption text */
    venueCaption?: string;
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

/**
 * Catalog hero section showcasing bespoke venue installations and grand
 * moongates, matching the Figma `.sectionLargeEventIns` spec.
 *
 * Layout:
 * - Rounded-48 dark gradient card with drop shadow and overflow-hidden wrapper.
 * - Decorative 288px purple radial blur blob positioned top-right.
 * - LEFT: gold-icon eyebrow pill, 32px Plus-Jakarta bold h2, description,
 *   horizontal 3-stats divider (gold numbers / light labels),
 *   gold primary CTA "Book Bespoke Stylist Consultation" and
 *   ghost "View Venue Portfolio" link with tiny arrow icon.
 * - RIGHT: large rounded venue image with bottom-left frosted glass overlay
 *   containing a camera icon and "The Roman Baths, Bath • Wedding Suite Setup".
 *
 * @example
 * <CatalogEventInstalls />
 */
export function CatalogEventInstalls({
    eyebrowIconSrc = '/figma-img/mui8bfpf-2yb4yo9.svg',
    eyebrowText = 'Corporate Events & Weddings',
    headline = 'Bespoke Venue Installations & Grand Moongates',
    description = 'Planning a milestone gala, wedding breakfast, or brand launch? Our mobile Bristol & London design teams install freestanding 2.4m golden arches, organic balloon ceiling clouds, and custom photo backdrops on-site.',
    stat1Number = '1,200+',
    stat1Label = 'UK Venues Styled',
    stat2Number = '48hr',
    stat2Label = 'Fast Turnaround',
    stat3Number = '100%',
    stat3Label = 'Biodegradable Latex',
    ctaLabel = 'Book Bespoke Stylist Consultation',
    portfolioLabel = 'View Venue Portfolio',
    arrowIconSrc = '/figma-img/mui8bfpf-e85hjtl.svg',
    venueImageSrc = '/figma-img/mui8bfq9-gbincl0.png',
    venueImageAlt = 'Grand moongate and ceiling balloon installation at The Roman Baths wedding suite',
    cameraIconSrc = '/figma-img/mui8bfpf-f24p0a1.svg',
    venueCaption = 'The Roman Baths, Bath • Wedding Suite Setup',
    className,
    id,
}: CatalogEventInstallsProps) {
    const headingId = id ? `${id}-heading` : 'event-installs-heading';
    const sectionId = id ? `${id}-section` : 'event-installs-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'mx-auto w-full max-w-[1280px] px-10 py-16',
                className,
            )}
        >
            {/* Dark gradient rounded-48 card with shadow */}
            <div
                className="relative flex w-full flex-col overflow-hidden rounded-[48px] p-16"
                style={{
                    background:
                        'linear-gradient(155deg, #352b4d 0%, #4a2a6e 50%, #352b4d 100%)',
                    boxShadow: '0px 16px 40px -6px rgba(53,43,77,0.25)',
                }}
            >
                {/* Decorative purple radial ambient blur blob (288px+) */}
                <div
                    className="absolute rounded-full blur-[32px]"
                    style={{
                        top: '-40px',
                        right: '-40px',
                        width: '384px',
                        height: '384px',
                        background: 'rgba(99,14,212,0.20)',
                    }}
                />

                {/* Two-column content row */}
                <div className="relative z-[1] flex w-full items-center justify-between gap-10">
                    {/* LEFT: eyebrow / headline / copy / stats / CTAs */}
                    <div className="flex max-w-[610px] flex-col items-start gap-0">
                        {/* Eyebrow pill with gold icon */}
                        <div className="mb-2 pb-2">
                            <div
                                className="inline-flex items-center gap-1 rounded-full px-3 py-1"
                                style={{
                                    boxShadow:
                                        '0px 1px 2px 0px rgba(0,0,0,0.05)',
                                    background: '#7C3AED',
                                }}
                            >
                                <img
                                    src={eyebrowIconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[14px] w-[14px] shrink-0"
                                />
                                <span
                                    className="font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-white"
                                    style={{ fontSize: '12px' }}
                                >
                                    {eyebrowText}
                                </span>
                            </div>
                        </div>

                        {/* H2: 32px Plus-Jakarta w800 ink */}
                        <h2
                            id={headingId}
                            className="mb-2 pb-2 font-plus-jakarta font-extrabold tracking-tight text-[#F6EDFF]"
                            style={{
                                fontSize: '32px',
                                lineHeight: '56px',
                                letterSpacing: '-1.2px',
                            }}
                        >
                            {headline}
                        </h2>

                        {/* Description copy */}
                        <div className="mr-8 mb-6 pb-6">
                            <p
                                className="font-sans leading-7 text-[#E9DDFF]"
                                style={{ fontSize: '18px' }}
                            >
                                {description}
                            </p>
                        </div>

                        {/* 3 stats with top divider */}
                        <div className="mb-6 w-full pb-6">
                            <div
                                className="flex w-full items-start justify-center gap-4 pt-[7px]"
                                style={{
                                    borderTop:
                                        '1px solid rgba(123,116,135,0.30)',
                                }}
                            >
                                {[
                                    { num: stat1Number, label: stat1Label },
                                    { num: stat2Number, label: stat2Label },
                                    { num: stat3Number, label: stat3Label },
                                ].map((s, sIdx) => (
                                    <div
                                        key={`stat-${sIdx}`}
                                        className="flex flex-1 flex-col items-start"
                                    >
                                        <span
                                            className="w-full font-plus-jakarta leading-10 font-extrabold text-popjoy-gold"
                                            style={{
                                                fontSize: '32px',
                                                letterSpacing: '-0.64px',
                                            }}
                                        >
                                            {s.num}
                                        </span>
                                        <span
                                            className="w-full font-sans leading-4 text-[#E9DDFF]"
                                            style={{
                                                fontSize: '11px',
                                                letterSpacing: '0.33px',
                                            }}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Buttons row */}
                        <div className="flex shrink-0 items-center gap-3">
                            {/* Primary: gold CTA button with shadow */}
                            <button
                                type="button"
                                className="inline-flex shrink-0 items-center justify-center rounded-full bg-popjoy-gold transition-opacity hover:opacity-90"
                                style={{
                                    boxShadow:
                                        '0px 8px 20px -4px rgba(253,196,37,0.40)',
                                }}
                            >
                                <span
                                    className="px-10 py-3 font-sans leading-[18px] font-bold text-popjoy-gold-ink"
                                    style={{
                                        fontSize: '14px',
                                        letterSpacing: '0.14px',
                                    }}
                                >
                                    {ctaLabel}
                                </span>
                            </button>

                            {/* Secondary: ghost portfolio link + tiny arrow */}
                            <button
                                type="button"
                                className="inline-flex shrink-0 items-center gap-1 rounded-full px-6 py-3 transition-colors hover:bg-white/5"
                                style={{ background: '#352b4d' }}
                            >
                                <span
                                    className="font-sans leading-[18px] font-semibold text-[#F6EDFF]"
                                    style={{
                                        fontSize: '14px',
                                        letterSpacing: '0.14px',
                                    }}
                                >
                                    {portfolioLabel}
                                </span>
                                <img
                                    src={arrowIconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="shrink-0"
                                    style={{ width: '10px', height: '10px' }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Venue image with bottom glass overlay caption */}
                    <div className="ml-10 shrink-0">
                        <div
                            className="overflow-hidden rounded-[32px]"
                            style={{
                                boxShadow:
                                    '0px 25px 50px -12px rgba(0,0,0,0.25)',
                                background: '#ffffff',
                            }}
                        >
                            <div
                                className="relative"
                                style={{ width: '423px', height: '231px' }}
                            >
                                <img
                                    src={venueImageSrc}
                                    alt={venueImageAlt}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />

                                {/* Bottom-left frosted glass caption with camera icon */}
                                <div
                                    className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-3 py-1"
                                    style={{
                                        background: 'rgba(53,43,77,0.85)',
                                        backdropFilter: 'blur(6px)',
                                        width: '295px',
                                        height: '22px',
                                    }}
                                >
                                    <img
                                        src={cameraIconSrc}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-[12px] w-[9px] shrink-0"
                                    />
                                    <span
                                        className="shrink-0 font-sans leading-4 text-popjoy-gold"
                                        style={{
                                            fontSize: '11px',
                                            letterSpacing: '0.33px',
                                        }}
                                    >
                                        {venueCaption}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
