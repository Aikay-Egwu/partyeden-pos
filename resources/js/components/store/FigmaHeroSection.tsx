import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

/**
 * Trust badge item used in the hero section trust row.
 */
export type FigmaTrustBadge = {
    /** Emoji or icon character */
    icon: string;
    /** Badge text label */
    label: string;
};

/**
 * Props for the FigmaHeroSection component.
 * Matches Figma `.section1Herosection` / `.container19`:
 * eyebrow pill, headline, description, shop CTA, dual CTAs,
 * trust badges, and hero visual collage with two floating badges.
 */
export type FigmaHeroSectionProps = {
    /** Optional trust badges. Falls back to the 4 default badges. */
    trustBadges?: FigmaTrustBadge[];
    /** Optional additional className for the section container */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultTrustBadges: FigmaTrustBadge[] = [
    { icon: '🎈', label: '100% Pre-inflated' },
    { icon: '🚚', label: '7-Day Named Delivery' },
    { icon: '✨', label: 'Eco Latex & Ribbons' },
    { icon: '⭐', label: '4.9/5 (8,500+ Reviews)' },
];

/**
 * Hero section matching the Figma `.section1Herosection` + `.container19` spec.
 * Left side: eyebrow pill, Plus Jakarta headline, description,
 * shop CTA, dual CTA buttons, trust badges.
 * Right side: hero image collage rotated 1° with 4px white border,
 * floating custom-typography card (top-left) and rating box card (bottom-right).
 *
 * Fully responsive:
 * - On mobile (<lg) everything stacks vertically with headline scales fluidly
 * - From md+ headline & CTA grow to the desktop sizes
 * - Floating badges are repositioned on small screens so they stay inside the
 *   visual bounds instead of bleeding off canvas
 */
export function FigmaHeroSection({
    trustBadges = defaultTrustBadges,
    className,
    id,
}: FigmaHeroSectionProps) {
    return (
        <section
            id={id}
            aria-label="Hero"
            className={cn('relative w-full overflow-hidden', className)}
        >
            {/* Decorative blurred backgrounds */}
            <div className="absolute top-0 left-0 h-60 w-70 -translate-x-1/4 rounded-full bg-popjoy-purple-surface/40 blur-[32px] sm:h-96 sm:w-107.25 sm:translate-x-0" />
            <div
                className="absolute h-60 w-70 rounded-full blur-[32px] sm:h-96 sm:w-[384px]"
                style={{
                    background: 'rgba(255, 223, 154, 0.4)',
                    top: '120px',
                    right: '-40px',
                }}
            />

            {/* Main content */}
            <div
                className="relative flex w-full flex-col items-center justify-between gap-10 px-4 py-10 sm:px-6 sm:py-15 lg:h-173.5 lg:flex-row lg:px-8 lg:py-20.5"
                style={{
                    backgroundImage:
                        'linear-gradient(180deg, #fef7ff 0%, #f9f1ff 50%, #fef7ff 100%)',
                }}
            >
                {/* Left: text + interactive */}
                <div className="flex w-full max-w-180 flex-col items-start gap-5 lg:max-w-none lg:flex-1 lg:gap-6">
                    {/* Eyebrow pill */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-popjoy-purple-surface bg-popjoy-purple-bg px-3 py-1 sm:px-3.25 sm:py-1.25">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-popjoy-gold" />
                        {/* <span className="font-sans text-[10px] leading-4 font-bold tracking-[0.3px] text-popjoy-purple sm:text-xs">
                            VOTED UK&apos;s #1 LUXURY BALLOON DELIVERY
                        </span> */}
                    </div>

                    {/* Headline — fluid scale clamped from ~32px on 360px
                         up to the 60px desktop size in the Figma spec. */}
                    <h1 className="flex w-full max-w-155 flex-col items-start">
                        <span className="w-full">
                            <span
                                className="block font-plus-jakarta leading-tight tracking-tight text-popjoy-ink"
                                style={{
                                    fontSize: 'clamp(2rem, 5.8vw, 3.75rem)',
                                    fontWeight: 800,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Make Every Moment
                                <br />
                            </span>
                            <span
                                className="block leading-tight text-gray-700"
                                style={{
                                    fontSize: 'clamp(2rem, 5.8vw, 3.75rem)',
                                    letterSpacing: '-1px',
                                }}
                            >
                                Float ✨
                            </span>
                        </span>
                    </h1>

                    {/* Description */}
                    <div className="flex w-full max-w-2xl flex-col items-start">
                        <p className="w-full font-sans text-[15px] leading-6 text-popjoy-muted sm:text-lg sm:leading-7">
                            Luxury inflated balloon bouquets, bespoke ceiling
                            installs, and personalised crystal bubble balloons
                            delivered directly to your door anywhere in the UK.
                            Unbox pure magic!
                        </p>
                    </div>

                    {/* Shop CTA */}
                    <Link
                        href="/products"
                        className="inline-flex h-16 w-full max-w-xl items-center justify-center gap-3 rounded-2xl bg-popjoy-gold px-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-popjoy-purple focus-visible:ring-offset-2 sm:h-19.25 sm:px-8"
                    >
                        <span
                            className="font-plus-jakarta text-base leading-6 font-bold tracking-[0.35px] text-popjoy-gold-ink sm:text-lg"
                            style={{ letterSpacing: '0.35px' }}
                        >
                            Shop now
                        </span>
                        <img
                            src="/figma-img/muhjqso4-fkgmdpk.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-2.75 w-3.75 shrink-0"
                        />
                    </Link>

                    {/* Dual CTA buttons — stack on mobile, inline on md+ */}
                    <div className="flex w-full flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4 sm:pt-2">
                        {/* Primary purple CTA */}
                        <a
                            href="#"
                            className="flex w-full items-center rounded-full bg-popjoy-purple transition-opacity hover:opacity-90 sm:w-67.75 sm:shrink-0"
                        >
                            <div
                                className="flex h-12 w-full min-w-0 flex-1 items-center justify-between rounded-full px-6 sm:px-7"
                                style={{
                                    boxShadow:
                                        '0px 10px 15px -3px rgba(99,14,212,0.25), 0px 4px 6px -4px rgba(99,14,212,0.25)',
                                }}
                            >
                                <span className="font-plus-jakarta text-xs leading-5 font-bold tracking-[0.35px] text-white sm:text-sm">
                                    Shop Personalised Balloons
                                </span>
                                <img
                                    src="/figma-img/muhjqso4-eqzsvcn.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-2.75 w-2.75 shrink-0"
                                />
                            </div>
                        </a>

                        {/* Secondary gold CTA */}
                        <a
                            href="#"
                            className="inline-flex w-full items-center justify-between gap-2 rounded-full border border-popjoy-gold/30 bg-popjoy-gold px-5 py-3.25 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-opacity hover:opacity-90 sm:w-auto sm:justify-center"
                            style={{ borderColor: 'rgba(120,90,0,0.2)' }}
                        >
                            <span
                                className="font-plus-jakarta text-xs leading-5 font-bold tracking-[0.35px] text-popjoy-gold-ink sm:text-sm"
                                style={{ letterSpacing: '0.35px' }}
                            >
                                Explore Birthday Stacks
                            </span>
                            <img
                                src="/figma-img/muhjqso4-pz848wl.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-3.5 w-3.5 shrink-0 sm:ml-0"
                            />
                        </a>
                    </div>

                    {/* Trust badges — wrap to 2 rows on mobile */}
                    <div className="flex w-full flex-wrap items-start justify-start gap-3 border-t border-popjoy-divider/40 pt-4 sm:justify-center sm:gap-3 sm:pt-3.75">
                        {trustBadges.map((badge, index) => (
                            <div
                                key={`${badge.label}-${index}`}
                                className="flex min-w-35 shrink-0 items-center gap-2 sm:w-40.75"
                            >
                                <span
                                    className="text-base leading-6 text-popjoy-ink"
                                    style={{ lineHeight: '24px' }}
                                >
                                    {badge.icon}
                                </span>
                                <span className="font-sans text-[11px] leading-4 font-semibold text-popjoy-ink sm:text-xs">
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: hero visual collage — stacked below text on mobile */}
                <div className="relative flex w-full max-w-135 flex-col items-start">
                    {/* Main hero image wrapper — fluid height via aspect */}
                    <div className="relative w-full max-w-121.75 self-center">
                        <div
                            className="relative aspect-479/488 w-full shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-popjoy-purple-bg sm:h-122 sm:w-119.75"
                            style={{
                                transform: 'rotate(1deg)',
                                boxShadow:
                                    '0px 25px 50px -12px rgba(0,0,0,0.25)',
                            }}
                        >
                            <img
                                src="/images/home-page.jpg"
                                alt="Luxury birthday balloon bouquet"
                                className="h-full w-full shrink-0 self-stretch overflow-hidden object-cover"
                            />
                        </div>
                    </div>

                    {/* Floating badge card 1 - top left (pulled in on mobile) */}
                    {/* <div className="absolute -top-2 left-0 z-10 flex h-[70px] w-[200px] shrink-0 items-center rounded-2xl border border-popjoy-purple-surface bg-white sm:left-[-28px] sm:w-[211px]">
                        <div
                            className="flex h-[70px] w-full min-w-0 flex-1 items-center justify-between rounded-2xl p-3"
                            style={{
                                boxShadow:
                                    '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
                            }}
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-[48px] bg-popjoy-purple-soft">
                                <img
                                    src="/figma-img/muhjqso4-12n47iz.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[18px] w-[21px] shrink-0"
                                />
                            </div>
                            <div className="inline-flex min-w-0 flex-col items-start px-1">
                                <span className="self-stretch truncate font-sans text-[11px] leading-[17px] font-bold text-popjoy-muted-light">
                                    Custom Typography
                                </span>
                                <span className="truncate font-sans text-xs leading-4 font-bold text-popjoy-ink">
                                    &quot;Happy 30th Sophia!&quot;
                                </span>
                            </div>
                        </div>
                    </div> */}

                    {/* Floating badge card 2 - bottom right (pulled in on mobile) */}
                    {/* <div
                        className="absolute right-0 bottom-[-16px] z-10 flex h-[66px] w-[205px] shrink-0 items-center rounded-2xl border bg-white sm:right-[-24px] sm:w-[209px]"
                        style={{ borderColor: '#ffdf9a' }}
                    >
                        <div
                            className="mr-[-2px] flex h-[66px] w-full min-w-0 flex-1 items-center justify-between rounded-2xl p-[13px]"
                            style={{
                                boxShadow:
                                    '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
                            }}
                        >
                            <div className="flex w-10 items-center justify-center rounded-full bg-popjoy-gold pt-3 pb-[13px]">
                                <span className="font-sans text-xs leading-4 font-bold text-popjoy-gold-ink">
                                    ★ 4.9
                                </span>
                            </div>
                            <div className="inline-flex min-w-0 flex-col items-start px-2">
                                <span className="truncate font-sans text-xs leading-4 font-bold text-popjoy-ink">
                                    Delivered In Giant Box
                                </span>
                                <span className="self-stretch truncate font-sans text-[10px] leading-[15px] font-medium text-popjoy-muted">
                                    Floats right out on opening!
                                </span>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </section>
    );
}
