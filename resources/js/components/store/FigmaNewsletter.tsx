import { cn } from '@/lib/utils';

/**
 * Props for the FigmaNewsletter component.
 * Matches Figma `.container84` dark purple pill layout:
 * VIP eyebrow, £10 discount headline, subtitle, email input + gold CTA button.
 */
export type FigmaNewsletterProps = {
    /** Eyebrow label shown above the headline (uppercase) */
    eyebrow?: string;
    /** Main headline offering the incentive */
    headline?: string;
    /** Supporting subtitle / extra perks line */
    subtitle?: string;
    /** Placeholder text inside the email input field */
    inputPlaceholder?: string;
    /** Label for the gold CTA button */
    ctaLabel?: string;
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

/**
 * Newsletter / VIP Club signup matching the Figma `.container84` spec.
 * Rounded dark-purple pill-shaped container with soft blurred inner glow,
 * left-aligned text block (eyebrow, £10-off headline, perks subtitle),
 * inline email input + gold "Claim £10" CTA pill on the right.
 *
 * @example
 * <FigmaNewsletter />
 */
export function FigmaNewsletter({
    eyebrow = 'JOIN THE VIP PARTY CLUB',
    headline = 'Get £10 Off Your First Balloon Delivery',
    subtitle = 'Plus secret birthday perks and inspiration for your party calendar.',
    inputPlaceholder = 'Enter your email address...',
    ctaLabel = 'Claim £10',
    className,
    id,
}: FigmaNewsletterProps) {
    const headingId = id ? `${id}-heading` : 'newsletter-heading';
    const sectionId = id ? `${id}-section` : 'newsletter-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'flex w-full items-center justify-center bg-popjoy-bg px-4 py-10 sm:px-6 sm:py-12 lg:px-8',
                className,
            )}
        >
            <div
                className="relative flex w-full max-w-[1280px] shrink-0 flex-col items-start justify-between gap-8 overflow-hidden rounded-[40px] px-6 py-10 sm:rounded-[64px] sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:gap-10 lg:px-14"
                style={{
                    background:
                        'linear-gradient(135deg, #201637 0%, #3b1e6a 50%, #4c1d95 100%)',
                }}
            >
                {/* Soft blurred purple glow */}
                <div
                    className="absolute rounded-full opacity-60 blur-[64px]"
                    style={{
                        width: '240px',
                        height: '240px',
                        top: '-60px',
                        right: '-40px',
                        background: 'rgba(124, 58, 237, 0.6)',
                    }}
                />
                <div
                    className="absolute rounded-full opacity-40 blur-[48px]"
                    style={{
                        width: '220px',
                        height: '220px',
                        bottom: '-60px',
                        left: '-40px',
                        background: 'rgba(99, 14, 212, 0.5)',
                    }}
                />

                {/* Left: text block */}
                <div className="relative z-10 flex w-full max-w-[620px] flex-col items-start gap-3 lg:max-w-[620px]">
                    <span className="font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-gold uppercase">
                        {eyebrow}
                    </span>
                    <h2
                        id={headingId}
                        className="font-plus-jakarta leading-tight font-bold text-white"
                        style={{
                            fontSize: 'clamp(1.5rem, 4.5vw, 2.125rem)',
                            lineHeight: 1.24,
                        }}
                    >
                        {headline}
                    </h2>
                    <p className="max-w-[520px] font-sans text-sm leading-6 text-white/70">
                        {subtitle}
                    </p>
                </div>

                {/* Right: email input + CTA row: input above button on mobile, inline on md+ */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="relative z-10 flex w-full shrink-0 flex-col items-stretch gap-3 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-sm md:flex-row md:items-center md:gap-2 md:rounded-full"
                    role="form"
                    aria-label="Newsletter signup"
                >
                    <div className="flex flex-1 items-center px-4 py-3 sm:px-6">
                        <label htmlFor="newsletter-email" className="sr-only">
                            {inputPlaceholder}
                        </label>
                        <input
                            id="newsletter-email"
                            type="email"
                            placeholder={inputPlaceholder}
                            className="w-full min-w-0 bg-transparent font-sans text-sm leading-5 text-white outline-none placeholder:text-white/50"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-popjoy-gold px-6 py-[13px] shadow-[0px_6px_16px_-2px_rgba(253,196,37,0.5)] transition-opacity hover:opacity-90 md:w-auto md:px-7"
                    >
                        <span className="font-plus-jakarta text-sm leading-5 font-bold tracking-[0.35px] text-popjoy-gold-ink">
                            {ctaLabel}
                        </span>
                    </button>
                </form>
            </div>
        </section>
    );
}
