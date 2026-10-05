import { cn } from '@/lib/utils';

/**
 * Single real-unboxing testimonial card.
 */
export type FigmaProductTestimonial = {
    /** Verified star count 1-5 */
    stars: number;
    /** Verified buyer badge tone */
    tone?: 'purple' | 'gold';
    /** Full quotation, may contain \n for line breaks */
    quote: string;
    /** Customer photo / unboxing image src */
    photoSrc: string;
    /** Customer name */
    customerName: string;
    /** Role / delivery line, e.g. "Delivered to Kensington, London • 30th Birthday" */
    meta: string;
};

/**
 * Props for the FigmaProductTestimonials component.
 * Matches Figma `.a3RealTestimonialCar` — "REAL UNBOXINGS" eyebrow,
 * "Loved By Over 12,000 Celebrations" heading, and three
 * testimonial cards side-by-side each with star row, verified
 * buyer tag, the pull-quote, customer photo, and name/location line.
 */
export type FigmaProductTestimonialsProps = {
    /** Section eyebrow, e.g. "REAL UNBOXINGS" */
    eyebrow?: string;
    /** Main heading */
    title?: string;
    /** Sub-heading copy */
    subtitle?: string;
    /** Three testimonial cards to render */
    items?: FigmaProductTestimonial[];
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultItems: FigmaProductTestimonial[] = [
    {
        stars: 5,
        tone: 'purple',
        quote: "The look on my sister's face when the huge\nbox opened and this giant gold feather balloon\nfloated up was completely priceless! It stayed\nperfectly inflated for almost three full weeks.",
        photoSrc: '/figma-img/mui8gtp6-dunvpcg.png',
        customerName: 'Harriet W.',
        meta: 'Delivered to Kensington, London • 30th Birthday',
    },
    {
        stars: 5,
        tone: 'gold',
        quote: 'I added the fairy LED lights and the tassel tail\nupgrade. In the evening dim light, it looked like\npure fairytale magic! DPD delivered at 9:30 AM\nsharp before our party brunch.',
        photoSrc: '/figma-img/mui8gtp6-eobc0vd.png',
        customerName: 'David & Sarah P.',
        meta: 'Delivered to Edinburgh • Engagement Party',
    },
    {
        stars: 5,
        tone: 'purple',
        quote: 'The gold foil lettering quality is outstanding—\nno peeling edges, razor-sharp script\ntypography, and the wax-sealed card was such\nan elegant touch. Highly recommended!',
        photoSrc: '/figma-img/mui8gtp6-56r0ab7.png',
        customerName: 'Eleanor M.',
        meta: 'Delivered to Manchester • Baby Shower',
    },
];

/**
 * 3-column "Real Unboxings" testimonial section matching the Figma
 * product page. Each card has the 5-star + Verified Buyer chip header,
 * a pull-quote, and photo + name/location footer strip.
 *
 * @example
 * <FigmaProductTestimonials
 *   eyebrow="REAL UNBOXINGS"
 *   title="Loved By Over 12,000 Celebrations"
 * />
 */
export function FigmaProductTestimonials({
    eyebrow = 'REAL UNBOXINGS',
    title = 'Loved By Over 12,000 Celebrations',
    subtitle = 'See how our bespoke inflated crystal bubbles transform living rooms, dinners, and milestones\nacross the UK.',
    items = defaultItems,
    className,
    id,
}: FigmaProductTestimonialsProps) {
    return (
        <section
            id={id}
            className={cn(
                'flex w-full flex-col items-start gap-8 px-10 py-8',
                className,
            )}
            style={{ maxWidth: '1280px' }}
            aria-labelledby="product-testimonials-heading"
        >
            <div className="flex flex-col items-start gap-3">
                <p className="text-[12px] leading-4 font-bold tracking-[0.6px] text-popjoy-purple uppercase">
                    {eyebrow}
                </p>
                <h2
                    id="product-testimonials-heading"
                    className="font-plus-jakarta text-[36px] leading-[44px] font-bold tracking-[-1px] text-popjoy-ink"
                >
                    {title}
                </h2>
                <p className="max-w-[820px] text-[14px] leading-[18px] text-popjoy-muted">
                    {subtitle.split('\n').map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < subtitle.split('\n').length - 1 && <br />}
                        </span>
                    ))}
                </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-6">
                {items.slice(0, 3).map((item, i) => (
                    <TestimonialCard key={`t-${i}`} item={item} />
                ))}
            </div>
        </section>
    );
}

function TestimonialCard({ item }: { item: FigmaProductTestimonial }) {
    const badgeBg =
        item.tone === 'gold'
            ? 'bg-popjoy-gold/20 text-popjoy-gold-ink'
            : 'bg-popjoy-purple/15 text-popjoy-purple';

    return (
        <article className="flex flex-col items-start gap-4 rounded-3xl border border-popjoy-divider/30 bg-white p-5">
            <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: item.stars }).map((_, i) => (
                            <img
                                key={`star-${i}`}
                                src="/figma-img/mui8gto2-i3u8kz8.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-[18px] w-[18px]"
                            />
                        ))}
                    </div>
                    <span
                        className={cn(
                            'rounded-full px-3 py-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] uppercase',
                            badgeBg,
                        )}
                    >
                        Verified Buyer
                    </span>
                </div>
            </div>
            <p className="text-[15px] leading-[22px] text-popjoy-ink">
                {item.quote.split('\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < item.quote.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </p>
            <div className="flex w-full items-center gap-4 rounded-2xl border border-popjoy-divider/30 bg-popjoy-purple-bg/30 p-2">
                <div
                    className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white"
                    style={{
                        boxShadow:
                            '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
                    }}
                >
                    <img
                        src={item.photoSrc}
                        alt={`${item.customerName} unboxing photo`}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex flex-col items-start">
                    <p className="font-plus-jakarta text-[15px] leading-5 font-bold tracking-[0.14px] text-popjoy-ink">
                        {item.customerName}
                    </p>
                    <p className="text-[12px] leading-[16px] text-popjoy-muted">
                        {item.meta}
                    </p>
                </div>
            </div>
        </article>
    );
}
