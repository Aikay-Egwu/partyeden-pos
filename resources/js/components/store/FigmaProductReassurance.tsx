import { cn } from '@/lib/utils';

/**
 * Single trust/guarantee accordion item.
 */
export type FigmaProductAccordionItem = {
    /** Icon source path */
    iconSrc: string;
    /** Accordion summary text */
    label: string;
    /** Whether the expanded variant shows a gold-tinted background */
    goldTint?: boolean;
};

/**
 * Single 2-column reassurance card (delivery + gift card) above reviews.
 */
export type FigmaProductReassuranceCard = {
    /** Icon source path for the left badge */
    iconSrc: string;
    /** Bold heading */
    heading: string;
    /** Secondary descriptive text (may contain \n for line breaks) */
    body: string;
    /** Icon container background tint */
    tint?: 'purple' | 'gold';
};

/**
 * Props for the FigmaProductReassurance component.
 * Composes three blocks stacked vertically below the preview card:
 * 1) Two reassurance cards (ready to pop + gift note),
 * 2) Trustpilot verified rating row with CTA,
 * 3) Three-item guarantee accordion (float care, box contents, transit).
 */
export type FigmaProductReassuranceProps = {
    /** Two reassurance cards shown side by side */
    cards?: FigmaProductReassuranceCard[];
    /** Trustpilot rating score, e.g. "4.98 / 5.0" */
    trustScore?: string;
    /** Verified review count, e.g. "(618 verified reviews)" */
    reviewCount?: string;
    /** Number of stars to show (1-5) */
    stars?: number;
    /** CTA link text, e.g. "Read stories →" */
    trustCta?: string;
    /** Accordion items, 3 shown in the design */
    accordionItems?: FigmaProductAccordionItem[];
    /** Optional additional className for the container */
    className?: string;
    /** Optional id attribute for the outer container */
    id?: string;
};

const defaultCards: FigmaProductReassuranceCard[] = [
    {
        tint: 'purple',
        iconSrc: '/figma-img/mui8gto1-7r099c0.svg',
        heading: 'Arrives Ready to Pop',
        body: 'Fully assembled, pre-inflated,\nweighted, and floats directly out of\nthe giant delivery box.',
    },
    {
        tint: 'gold',
        iconSrc: '/figma-img/mui8gto1-jj05plo.svg',
        heading: 'Wax-Sealed Gift Card',
        body: 'Complimentary luxury textured gift\nnote sealed in a mini gold-\nembossed keepsake envelope.',
    },
];

const defaultAccordion: FigmaProductAccordionItem[] = [
    {
        iconSrc: '/figma-img/mui8gto1-1d3tqb1.svg',
        label: 'Float Care & Longevity Guarantee',
    },
    {
        iconSrc: '/figma-img/mui8gto1-spoz2bs.svg',
        label: "What's Included Inside The Giant Box",
    },
    {
        iconSrc: '/figma-img/mui8gto1-mcvae55.svg',
        label: 'Guaranteed Safe Transit & Courier Replacement',
        goldTint: true,
    },
];

/**
 * Vertical stack of trust indicators that sits below the 3D preview card
 * in the left column: delivery + gift cards, Trustpilot 5-star row, and
 * the 3-item guarantee accordion with chevron toggles.
 *
 * @example
 * <FigmaProductReassurance trustScore="4.98 / 5.0" reviewCount="(618 verified reviews)" />
 */
export function FigmaProductReassurance({
    cards = defaultCards,
    trustScore = '4.98 / 5.0',
    reviewCount = '(618 verified reviews)',
    stars = 5,
    trustCta = 'Read stories →',
    accordionItems = defaultAccordion,
    className,
    id,
}: FigmaProductReassuranceProps) {
    return (
        <div
            id={id}
            className={cn('flex flex-col items-start gap-6', className)}
        >
            {/* Two reassurance cards */}
            <div className="flex items-start justify-between gap-4 self-stretch">
                {cards.map((card, i) => (
                    <div
                        key={`card-${i}`}
                        className="flex w-[284px] shrink-0 items-center gap-3 rounded-2xl border border-popjoy-divider/40 bg-white p-4"
                        style={{
                            boxShadow:
                                '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
                        }}
                    >
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                                card.tint === 'gold'
                                    ? 'bg-popjoy-gold/15'
                                    : 'bg-popjoy-purple-surface/40',
                            )}
                        >
                            <img
                                src={card.iconSrc}
                                alt=""
                                aria-hidden="true"
                                className="h-[18px] w-[18px] shrink-0"
                            />
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="self-stretch font-plus-jakarta text-[18px] leading-6 font-semibold text-popjoy-ink">
                                {card.heading}
                            </p>
                            <p className="text-[13px] leading-[18px] font-medium text-popjoy-muted">
                                {card.body.split('\n').map((line, li) => (
                                    <span key={li}>
                                        {line}
                                        {li <
                                            card.body.split('\n').length -
                                                1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trustpilot verified rating row */}
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-popjoy-divider/30 bg-popjoy-purple-bg/30 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: stars }).map((_, i) => (
                            <img
                                key={`star-${i}`}
                                src="/figma-img/mui8gto1-fiibk1o.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-[18px] w-[18px] shrink-0"
                            />
                        ))}
                    </div>
                    <p className="text-[14px] leading-[18px] font-bold tracking-[0.14px] text-popjoy-ink">
                        {trustScore}
                    </p>
                    <p className="text-[13px] leading-[18px] text-popjoy-muted">
                        {reviewCount}
                    </p>
                </div>
                <a
                    href="#reviews"
                    className="text-[12px] leading-[16px] font-semibold tracking-[0.24px] text-popjoy-purple"
                >
                    {trustCta}
                </a>
            </div>

            {/* Guarantee accordion */}
            <div className="flex flex-col items-start gap-2 self-stretch">
                {accordionItems.map((item, i) => (
                    <button
                        key={`acc-${i}`}
                        type="button"
                        className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-popjoy-purple-surface',
                            item.goldTint
                                ? 'border-popjoy-gold-border bg-popjoy-gold/5'
                                : 'border-popjoy-divider/30 bg-white',
                        )}
                        aria-expanded="false"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={item.iconSrc}
                                alt=""
                                aria-hidden="true"
                                className="h-[20px] w-[20px] shrink-0"
                            />
                            <p className="font-plus-jakarta text-[18px] leading-6 font-semibold text-popjoy-ink">
                                {item.label}
                            </p>
                        </div>
                        <img
                            src="/figma-img/mui8gto1-doxv9wj.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[7px] w-[12px] shrink-0"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
