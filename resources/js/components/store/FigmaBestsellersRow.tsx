import { cn } from '@/lib/utils';

/**
 * Single bestseller product definition used in the 4-up row.
 */
export type FigmaBestsellerProduct = {
    /** Product image SVG/PNG source path */
    imageSrc: string;
    /** Image alt text */
    imageAlt: string;
    /** Pastel tile background color (hex) for the image area */
    tileBg: string;
    /** Badge pill text (e.g. "Bestseller", "Personalise Me", "Trending", "Easy DIY") */
    badgeLabel?: string;
    /** Badge variant — controls badge pill color */
    badgeVariant?: 'bestseller' | 'personalise' | 'trending' | 'diy';
    /** Star rating (1-5), rendered as ★ glyphs */
    rating: number;
    /** Rating meta line, e.g. "(4.9 · 320 reviews)" */
    ratingMeta: string;
    /** Product title (may contain <br/> for line breaks) */
    title: string;
    /** Short product feature line */
    subtitle: string;
    /** Price, e.g. "£48.00" */
    price: string;
    /** Option tagline, e.g. "Inflated In Box" */
    optionTag: string;
    /** Cart/add button icon source path */
    buttonIconSrc: string;
    /** Whether the right button is a "view details" chevron (product 2 only) */
    useChevronButton?: boolean;
};

/**
 * Props for the FigmaBestsellersRow component.
 * Matches Figma `.a4BestsellerCardsPro`: 4 product cards side by side,
 * each with pastel image tile, badge overlay, star rating,
 * title/subtitle, and price + cart button footer strip.
 */
export type FigmaBestsellersRowProps = {
    /** Optional array of 4 bestseller products. Falls back to default Party Eden bestsellers. */
    products?: FigmaBestsellerProduct[];
    /** Optional additional className for the section row */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultProducts: FigmaBestsellerProduct[] = [
    {
        imageSrc: '/figma-img/muhjqso4-8p8ss8t.svg',
        imageAlt: 'Pastel Sunset Number 18 Stack balloon',
        tileBg: '#f9f1ff',
        badgeLabel: 'Bestseller',
        badgeVariant: 'bestseller',
        rating: 5,
        ratingMeta: '(4.9 · 320 reviews)',
        title: 'The Pastel Sunset Number 18 Stack',
        subtitle: 'Includes helium, weights & ribbon',
        price: '£48.00',
        optionTag: 'Inflated In Box',
        buttonIconSrc: '/figma-img/muhjqso4-znbj01j.svg',
    },
    {
        imageSrc: '/figma-img/muhjqso4-w7epu3a.svg',
        imageAlt: 'Bespoke Feather Confetti Crystal Bubble',
        tileBg: '#fff4d6',
        badgeLabel: 'Personalise Me',
        badgeVariant: 'personalise',
        rating: 5,
        ratingMeta: '(4.9 · 540 reviews)',
        title: 'Bespoke Feather Confetti Crystal<br/>Bubble',
        subtitle: 'Custom text · 10 font choices',
        price: '£34.99',
        optionTag: 'Floats 10-14 Days',
        buttonIconSrc: '/figma-img/muhjqso4-w7epu3a.svg',
        useChevronButton: true,
    },
    {
        imageSrc: '/figma-img/muhjqso4-znbj01j.svg',
        imageAlt: 'Chrome Gold & Royal Purple Cluster',
        tileBg: '#eaddff',
        badgeLabel: 'Trending',
        badgeVariant: 'trending',
        rating: 5,
        ratingMeta: '(4.8 · 195 reviews)',
        title: 'Chrome Gold & Royal Purple Cluster',
        subtitle: 'Bouquet of 7 high-shine balloons',
        price: '£42.00',
        optionTag: 'Inflated In Box',
        buttonIconSrc: '/figma-img/muhjqso4-znbj01j.svg',
    },
    {
        imageSrc: '/figma-img/muhjqso4-znbj01j.svg',
        imageAlt: 'Ombre Rainbow Balloon Garland Kit',
        tileBg: '#f3e8ff',
        badgeLabel: 'Easy DIY',
        badgeVariant: 'diy',
        rating: 5,
        ratingMeta: '(4.9 · 410 reviews)',
        title: 'Ombre Rainbow Balloon Garland Kit',
        subtitle: 'Choose 2m or 4m · 65+ balloons',
        price: '£28.50',
        optionTag: 'Deflated Kit Box',
        buttonIconSrc: '/figma-img/muhjqso4-znbj01j.svg',
    },
];

function badgeStyles(variant: FigmaBestsellerProduct['badgeVariant']) {
    switch (variant) {
        case 'personalise':
            return 'bg-popjoy-purple text-white';
        case 'trending':
            return 'bg-popjoy-purple-soft text-white';
        case 'diy':
            return 'bg-popjoy-purple-surface text-popjoy-purple';
        case 'bestseller':
        default:
            return 'bg-popjoy-purple text-white';
    }
}

/**
 * 4-column bestsellers product row matching the Figma `.a4BestsellerCardsPro` spec.
 * Each card: pastel tile image area with a rounded badge overlay (top-left),
 * 5-star row with rating meta, product title + feature subtitle,
 * and a horizontal footer strip with price/option on the left and a
 * purple cart button (or chevron) on the right.
 *
 * @example
 * <FigmaBestsellersRow />
 */
export function FigmaBestsellersRow({
    products = defaultProducts,
    className,
    id,
}: FigmaBestsellersRowProps) {
    const headingId = id ? `${id}-heading` : 'bestsellers-heading';
    const sectionId = id ? `${id}-section` : 'bestsellers-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start bg-popjoy-bg px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8',
                className,
            )}
        >
            <h2 id={headingId} className="sr-only">
                Inflated Bestsellers
            </h2>

            {/* 4 product cards: grid that stacks 1 col → 2 col → 4 col */}
            <div className="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6 self-stretch">
                {products.map((product, index) => (
                    <article
                        key={`${product.title}-${index}`}
                        className="flex flex-1 flex-col items-start overflow-hidden rounded-3xl border border-popjoy-divider/40 bg-white transition-shadow hover:shadow-md"
                    >
                        {/* Top: image tile + badge + rating */}
                        <div className="flex shrink-0 flex-col items-start gap-3 self-stretch p-[15px]">
                            {/* Pastel tile image area */}
                            <div
                                className="relative flex h-[220px] shrink-0 items-center justify-center self-stretch overflow-hidden rounded-2xl"
                                style={{ background: product.tileBg }}
                            >
                                {/* Badge pill */}
                                {product.badgeLabel && (
                                    <div
                                        className={cn(
                                            'absolute top-3 left-3 inline-flex items-center justify-center rounded-full px-[10px] py-[5px] font-sans text-[10px] leading-4 font-bold tracking-[0.3px]',
                                            badgeStyles(product.badgeVariant),
                                        )}
                                    >
                                        {product.badgeLabel}
                                    </div>
                                )}
                                {/* Product image */}
                                <img
                                    src={product.imageSrc}
                                    alt={product.imageAlt}
                                    className="h-[140px] w-[140px] object-contain"
                                />
                            </div>

                            {/* Rating row */}
                            <div className="flex shrink-0 items-center gap-2 self-stretch">
                                <span className="text-xs leading-4 tracking-[1px] text-popjoy-star">
                                    {'★'.repeat(product.rating)}
                                </span>
                                <span className="font-sans text-[11px] leading-[17px] text-popjoy-muted">
                                    {product.ratingMeta}
                                </span>
                            </div>

                            {/* Title */}
                            <h3
                                className="shrink-0 self-stretch font-plus-jakarta text-sm leading-5 font-bold text-popjoy-ink"
                                dangerouslySetInnerHTML={{
                                    __html: product.title,
                                }}
                            />

                            {/* Subtitle */}
                            <p className="shrink-0 self-stretch font-sans text-[11px] leading-[17px] text-popjoy-muted">
                                {product.subtitle}
                            </p>
                        </div>

                        {/* Footer strip: price + option | cart button */}
                        <div className="mx-[15px] mb-[15px] shrink-0 self-stretch">
                            <div className="flex items-center justify-between self-stretch rounded-2xl border border-popjoy-divider/40 bg-popjoy-bg px-4 py-3">
                                <div className="flex flex-col items-start gap-[2px]">
                                    <span className="font-plus-jakarta text-base leading-6 font-bold text-popjoy-ink">
                                        {product.price}
                                    </span>
                                    <span className="font-sans text-[10px] leading-[15px] text-popjoy-muted">
                                        {product.optionTag}
                                    </span>
                                </div>
                                {product.useChevronButton ? (
                                    <button
                                        type="button"
                                        className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-popjoy-purple shadow-[0px_4px_6px_-1px_rgba(99,14,212,0.25)] transition-opacity hover:opacity-90"
                                        aria-label="View product details"
                                    >
                                        <img
                                            src={product.buttonIconSrc}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-[14px] w-[14px]"
                                        />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-popjoy-purple shadow-[0px_4px_6px_-1px_rgba(99,14,212,0.25)] transition-opacity hover:opacity-90"
                                        aria-label="Add to cart"
                                    >
                                        <img
                                            src={product.buttonIconSrc}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-[18px] w-[18px]"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
