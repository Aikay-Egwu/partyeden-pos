import { cn } from '@/lib/utils';

/**
 * A single Trustpilot-style gold star icon used in the rating header.
 * Each star is rendered as an img tag with the specified size.
 */
export type CatalogGoldStar = {
    /** Source of the gold star SVG */
    iconSrc: string;
    /** Alt text for accessibility (decorative by default) */
    alt?: string;
};

/**
 * Single customer review card definition used in the 3-up row.
 * Contains reviewer avatar, name/location/verification, 5 gold stars,
 * italic testimonial quote, and delivery footnote.
 */
export type CatalogCustomerReview = {
    /** Avatar/profile image src of the reviewer */
    avatarSrc: string;
    /** Avatar alt text */
    avatarAlt: string;
    /** Reviewer name + location line, e.g. "Gemma L. — Kensington" */
    nameLine: string;
    /** Verified order / product line, e.g. "Verified Order: 21st Milestone Stack" */
    verifiedLine: string;
    /** Source for the small gold star SVG repeated 5x */
    starIconSrc: string;
    /** Customer quote (may contain <br/> for line breaks) */
    quoteHtml: string;
    /** Delivery footnote, e.g. "Delivered 3 days ago via DPD 1hr slot" */
    deliveredFootnote: string;
};

/**
 * Props for the CatalogCustomerReviews component.
 * Matches Figma `.sectionVerifiedCusto` spec:
 * top header (5 gold Trustpilot stars, rating text, h2, sub),
 * followed by a 3-card review row.
 */
export type CatalogCustomerReviewsProps = {
    /** Gold star SVG used 5x in the Trustpilot rating bar */
    headerStarIconSrc?: string;
    /** Trustpilot rating text line */
    ratingText?: string;
    /** Main h2 headline */
    headline?: string;
    /** Subtitle below headline */
    subtitle?: string;
    /** 3 review cards displayed in the row */
    reviews?: CatalogCustomerReview[];
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultReviews: CatalogCustomerReview[] = [
    {
        avatarSrc: '/figma-img/mui8bfq9-xz7463m.png',
        avatarAlt: 'Gemma L. profile photo',
        nameLine: 'Gemma L. — Kensington',
        verifiedLine: 'Verified Order: 21st Milestone Stack',
        starIconSrc: '/figma-img/mui8bfpc-2tu7w0f.svg',
        quoteHtml:
            '"My daughter gasped when opening the box! It<br/>floated straight up with the weighted satin ribbon.<br/>It stayed completely buoyant for 12 days through<br/>all her birthday parties."',
        deliveredFootnote: 'Delivered 3 days ago via DPD 1hr slot',
    },
    {
        avatarSrc: '/figma-img/mui8bfq9-uq51mi0.png',
        avatarAlt: 'Marcus & Chloe profile photo',
        nameLine: 'Marcus & Chloe — Bristol',
        verifiedLine: 'Verified Order: Feather Crystal Bubble',
        starIconSrc: '/figma-img/mui8bfpc-2tu7w0f.svg',
        quoteHtml:
            '"The custom vinyl lettering was crisp and<br/>perfectly aligned in gold. Shipped directly to our<br/>hotel breakfast in the morning without any price<br/>tags inside. Unbelievable service."',
        deliveredFootnote: 'Delivered 1 week ago',
    },
    {
        avatarSrc: '/figma-img/mui8bfq9-t08d7v9.png',
        avatarAlt: 'Sarah T. profile photo',
        nameLine: 'Sarah T. — Solihull',
        verifiedLine: 'Verified Order: Baby Shower Teddy Cloud',
        starIconSrc: '/figma-img/mui8bfpc-2tu7w0f.svg',
        quoteHtml:
            '"The colors were even more gorgeous in person<br/>than on screen! Warm honey yellows and sage<br/>creams. Made the most gorgeous backdrop for<br/>our baby shower photos."',
        deliveredFootnote: 'Delivered 2 weeks ago',
    },
];

/**
 * Catalog verified customer reviews section matching the Figma
 * `.sectionVerifiedCusto` spec.
 *
 * Top header row:
 *   - LEFT: 5 inline gold stars + bold "4.9 / 5 Rating on Trustpilot (1,840+ reviews)"
 *           below: 32px Plus-Jakarta h2 "Unboxing Real Celebration Joy"
 *   - RIGHT (below): small muted subtitle line "@popandjoyballoons real British photos".
 *
 * Cards row: 3 x 389px wide rounded-3xl white review cards with subtle shadow:
 *   - Top row: 40px round avatar (reviewer photo) + (name + verified order line) + 5 stars.
 *   - Body: italic customer quote (line breaks via <br/>).
 *   - Footer: "Delivered X days ago..." muted footnote.
 *
 * @example
 * <CatalogCustomerReviews />
 */
export function CatalogCustomerReviews({
    headerStarIconSrc = '/figma-img/mui8bfpf-xkbet4c.svg',
    ratingText = '4.9 / 5 Rating on Trustpilot (1,840+ reviews)',
    headline = 'Unboxing Real Celebration Joy',
    subtitle = 'Real British customer photos tagged @popandjoyballoons',
    reviews = defaultReviews,
    className,
    id,
}: CatalogCustomerReviewsProps) {
    const headingId = id ? `${id}-heading` : 'reviews-heading';
    const sectionId = id ? `${id}-section` : 'reviews-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'mx-auto flex w-full max-w-[1280px] flex-col items-start px-10 pb-16',
                className,
            )}
            style={{ rowGap: '24px' }}
        >
            {/* ====== TOP: Rating + headline + subtitle ====== */}
            <div className="flex w-full items-end justify-between">
                <div
                    className="inline-flex flex-col items-start"
                    style={{ rowGap: '4px' }}
                >
                    {/* 5 gold stars + rating label inline */}
                    <div
                        className="flex w-full items-center"
                        style={{ columnGap: '8px' }}
                    >
                        <div
                            className="inline-flex shrink-0 items-center"
                            style={{ columnGap: '0' }}
                        >
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                                <img
                                    key={`header-star-${sIdx}`}
                                    src={headerStarIconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[15px] w-[15px] shrink-0"
                                />
                            ))}
                        </div>
                        <span
                            className="shrink-0 font-sans font-bold text-popjoy-ink"
                            style={{
                                fontSize: '14px',
                                lineHeight: '18px',
                                letterSpacing: '0.14px',
                            }}
                        >
                            {ratingText}
                        </span>
                    </div>

                    {/* H2: 32px Plus-Jakarta w700 ink */}
                    <h2
                        id={headingId}
                        className="w-full font-plus-jakarta font-bold text-popjoy-ink"
                        style={{
                            fontSize: '32px',
                            lineHeight: '40px',
                            letterSpacing: '-0.64px',
                        }}
                    >
                        {headline}
                    </h2>
                </div>
            </div>

            {/* Subtitle below header */}
            <p
                className="shrink-0 font-sans font-medium text-popjoy-muted"
                style={{
                    fontSize: '11px',
                    lineHeight: '14px',
                    letterSpacing: '0.33px',
                }}
            >
                {subtitle}
            </p>

            {/* ====== 3 review cards row ====== */}
            <div
                className="flex w-full shrink-0 items-start justify-center"
                style={{ columnGap: '16px' }}
            >
                {reviews.map((review, rIdx) => (
                    <article
                        key={`review-${rIdx}`}
                        className="flex shrink-0 flex-col items-start justify-between rounded-[32px] p-4"
                        style={{
                            width: '389px',
                            minWidth: '389px',
                            boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                            background: '#ffffff',
                        }}
                    >
                        {/* Inner content: avatar row + stars + quote */}
                        <div
                            className="flex w-full shrink-0 flex-col items-start"
                            style={{ rowGap: '8px' }}
                        >
                            {/* Avatar + name + verified line */}
                            <div
                                className="flex w-full shrink-0 items-center"
                                style={{ columnGap: '8px' }}
                            >
                                <div
                                    className="flex shrink-0 flex-col items-start justify-center overflow-hidden rounded-full"
                                    style={{
                                        background: '#F4EAFF',
                                        height: '40px',
                                        width: '40px',
                                    }}
                                >
                                    <img
                                        src={review.avatarSrc}
                                        alt={review.avatarAlt}
                                        className="h-full w-full object-cover"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                        }}
                                    />
                                </div>
                                <div className="inline-flex shrink-0 flex-col items-start">
                                    <span
                                        className="w-full shrink-0 font-sans font-bold text-popjoy-ink"
                                        style={{
                                            fontSize: '14px',
                                            lineHeight: '18px',
                                            letterSpacing: '0.14px',
                                        }}
                                    >
                                        {review.nameLine}
                                    </span>
                                    <span
                                        className="w-full shrink-0 font-sans font-medium text-popjoy-muted"
                                        style={{
                                            fontSize: '11px',
                                            lineHeight: '14px',
                                            letterSpacing: '0.33px',
                                        }}
                                    >
                                        {review.verifiedLine}
                                    </span>
                                </div>
                            </div>

                            {/* 5 gold stars row */}
                            <div
                                className="flex w-full shrink-0 items-center pt-1"
                                style={{ columnGap: '0' }}
                            >
                                {Array.from({ length: 5 }).map((_, sIdx) => (
                                    <img
                                        key={`card-star-${rIdx}-${sIdx}`}
                                        src={review.starIconSrc}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-[13px] w-[13px] shrink-0"
                                    />
                                ))}
                            </div>

                            {/* Customer quote (italic) */}
                            <p
                                className="w-full shrink-0 font-sans text-popjoy-ink italic"
                                style={{
                                    width: '357px',
                                    fontSize: '15px',
                                    lineHeight: '22px',
                                    letterSpacing: '0',
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: review.quoteHtml,
                                }}
                            />
                        </div>

                        {/* Delivered footnote */}
                        <p
                            className="w-full shrink-0 self-stretch pt-3 font-sans font-medium text-popjoy-muted"
                            style={{
                                fontSize: '11px',
                                lineHeight: '14px',
                                letterSpacing: '0.33px',
                            }}
                        >
                            {review.deliveredFootnote}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
