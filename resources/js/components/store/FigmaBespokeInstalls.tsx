import { cn } from '@/lib/utils';

/**
 * Props for the FigmaBespokeInstalls component.
 * Matches Figma `.section6Bespokeinsta` spec:
 * full-width section with decorative accent circles,
 * blurred/overlayed background photo of a suspended balloon install,
 * eyebrow pill, headline, 3-line description,
 * purple "Book Design Consultation" solid CTA and "Download 2025 Lookbook" link CTA.
 */
export type FigmaBespokeInstallsProps = {
    /** Eyebrow pill label */
    eyebrow?: string;
    /** Main headline (may include <br/> for line breaks) */
    headline?: string;
    /** Description paragraph (may include <br/> for line breaks) */
    description?: string;
    /** Lookbook download icon source */
    lookbookIconSrc?: string;
    /** Background hero image source */
    backgroundImageSrc?: string;
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

/**
 * Bespoke event installs / venue transformation section matching the
 * Figma `.section6Bespokeinsta` + `.accentCircles` spec.
 * Full-width section with dark blurred gradient overlay and accent circles.
 * Left side: translucent eyebrow pill, large white headline,
 * white supporting copy, and a two-button CTA row:
 * filled purple "Book Design Consultation" with drop shadow,
 * and an outlined/ghost "Download 2025 Lookbook" link with download icon.
 * Right side: rounded-corner background photo of suspended balloon ceiling
 * with overlay blur/shadow layer on top.
 *
 * @example
 * <FigmaBespokeInstalls />
 */
export function FigmaBespokeInstalls({
    eyebrow = 'EVENT STYLING & VENUE TRANSFORMATION',
    headline = 'Suspended Balloon Ceilings<br/>& Organic Moongate<br/>Arches',
    description = 'Planning a luxury wedding, corporate gala, brand pop-up, or milestone anniversary?<br/>Our award-winning installation artists create breath-taking, bespoke balloon<br/>architecture across London and the UK.',
    lookbookIconSrc = '/figma-img/muhjqso4-62cye1q.svg',
    backgroundImageSrc = '/figma-img/muhjqsom-pznlzvu.png',
    className,
    id,
}: FigmaBespokeInstallsProps) {
    const headingId = id ? `${id}-heading` : 'bespoke-installs-heading';
    const sectionId = id ? `${id}-section` : 'bespoke-installs-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn('relative w-full overflow-hidden', className)}
        >
            {/* Accent circles + background shadow wrapper */}
            <div
                className="relative flex w-full flex-col items-center justify-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:gap-12 lg:px-8"
                style={{
                    background:
                        'linear-gradient(180deg, #fef7ff 0%, #f9f1ff 50%, #fef7ff 100%)',
                }}
            >
                {/* Decorative accent circles — blurry purple blobs */}
                <div
                    className="absolute rounded-full bg-popjoy-purple-surface/60 blur-[32px]"
                    style={{
                        width: '240px',
                        height: '240px',
                        top: '40px',
                        left: '-60px',
                    }}
                />
                <div
                    className="absolute rounded-full blur-[32px]"
                    style={{
                        width: '220px',
                        height: '220px',
                        bottom: '20px',
                        right: '-40px',
                        background: 'rgba(255, 223, 154, 0.5)',
                    }}
                />

                {/* Main content row */}
                <div className="relative flex w-full max-w-[1280px] flex-col items-center justify-between gap-10 lg:flex-row">
                    {/* Left: text + CTAs */}
                    <div className="z-10 flex w-full max-w-[620px] flex-col items-start gap-5 sm:gap-6">
                        {/* Eyebrow pill */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-popjoy-purple-surface bg-popjoy-purple-bg px-4 py-[6px] backdrop-blur-sm">
                            <span className="font-sans text-[11px] leading-[17px] font-bold tracking-[0.6px] text-popjoy-purple uppercase">
                                {eyebrow}
                            </span>
                        </div>

                        {/* Headline: fluid clamp 2rem → 3rem */}
                        <h2
                            id={headingId}
                            className="font-plus-jakarta leading-[1.15] font-bold tracking-tight text-popjoy-ink"
                            style={{
                                fontSize: 'clamp(2rem, 5.5vw, 3rem)',
                            }}
                            dangerouslySetInnerHTML={{ __html: headline }}
                        />

                        {/* Description */}
                        <p
                            className="font-sans text-[15px] leading-6 text-popjoy-muted sm:text-base sm:leading-7"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />

                        {/* CTA row: stack on mobile, inline on sm+ */}
                        <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                            {/* Primary: Book consultation (purple) */}
                            <button
                                type="button"
                                className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-popjoy-purple px-6 py-[14px] transition-opacity hover:opacity-90 sm:w-auto sm:px-7 sm:py-[15px]"
                                style={{
                                    boxShadow:
                                        '0px 12px 20px -4px rgba(99,14,212,0.3), 0px 4px 8px -2px rgba(99,14,212,0.2)',
                                }}
                            >
                                <span className="font-plus-jakarta text-sm leading-5 font-bold tracking-[0.35px] text-white">
                                    Book Design Consultation
                                </span>
                            </button>

                            {/* Secondary: Download lookbook (link style) */}
                            <button
                                type="button"
                                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border-2 border-popjoy-divider/60 bg-white px-5 py-[13px] transition-colors hover:border-popjoy-purple/40 sm:w-auto sm:justify-start"
                            >
                                <img
                                    src={lookbookIconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[18px] w-[18px] shrink-0"
                                />
                                <span className="font-plus-jakarta text-sm leading-5 font-bold tracking-[0.35px] text-popjoy-ink">
                                    Download 2025 Lookbook
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right: background photo with overlay blur/shadow */}
                    <div className="relative z-10 w-full max-w-[560px] self-center lg:w-auto lg:shrink-0">
                        {/* Outer shadow border wrapper */}
                        <div
                            className="overflow-hidden rounded-[28px]"
                            style={{
                                boxShadow:
                                    '0px 30px 60px -15px rgba(32,22,55,0.35), 0px 10px 20px -5px rgba(32,22,55,0.2)',
                            }}
                        >
                            {/* Image container — aspect ratio on mobile, fixed on lg */}
                            <div className="relative aspect-[4/3] w-full lg:h-[420px] lg:w-[560px]">
                                <img
                                    src={backgroundImageSrc}
                                    alt="Suspended balloon ceiling installation at a luxury venue"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                {/* Subtle overlay blur / gradient tint */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(99,14,212,0.12) 0%, rgba(253,196,37,0.08) 50%, rgba(32,22,55,0.15) 100%)',
                                    }}
                                />
                                {/* Inner soft border glow */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-[28px]"
                                    style={{
                                        boxShadow:
                                            'inset 0 0 0 1px rgba(255,255,255,0.2)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
