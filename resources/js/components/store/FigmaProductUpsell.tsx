import { cn } from '@/lib/utils';

/**
 * Single product upsell card in the "Frequently Ordered Together" row.
 */
export type FigmaUpsellProduct = {
    /** Thumbnail image src (may be empty — pastel tile placeholder is used) */
    imageSrc?: string;
    /** Tile pastel background color when image is omitted */
    tileBg: string;
    /** Badge label overlay, e.g. "Helium Ready" */
    badgeLabel: string;
    /** Badge tone — controls badge background/foreground */
    badgeVariant?: 'purple' | 'gold' | 'rose';
    /** Bold product title, may contain <br/> */
    title: string;
    /** Short product descriptor, may contain \n for line breaks */
    subtitle: string;
    /** Add-on price, e.g. "+£16.00" */
    addPrice: string;
    /** Whether the item is currently added (affects the CTA) */
    added?: boolean;
};

/**
 * Props for the FigmaProductUpsell component.
 * Matches Figma `.upsellSectionFrequen`: "PARTY PAIRINGS" eyebrow,
 * title + description, the "Add All 3" CTA, and three upsell cards
 * with tile/badge, title/subtitle, and "+£X.XX" price + Add to Order button.
 */
export type FigmaProductUpsellProps = {
    /** Section eyebrow, e.g. "PARTY PAIRINGS" */
    eyebrow?: string;
    /** Main heading */
    title?: string;
    /** Sub-heading copy */
    subtitle?: string;
    /** Add-all bulk CTA label, e.g. "Add All 3 to Basket (+£27.50)" */
    addAllLabel?: string;
    /** Three upsell product cards */
    products?: FigmaUpsellProduct[];
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultProducts: FigmaUpsellProduct[] = [
    {
        tileBg: '#f3e8ff',
        badgeLabel: 'Helium Ready',
        badgeVariant: 'purple',
        title: 'Matching 3-Foil Balloon Bouquet',
        subtitle:
            'Gleaming gold star, lilac heart & metallic violet orb\nballoons weighted together.',
        addPrice: '+£16.00',
    },
    {
        tileBg: '#fff4d6',
        badgeLabel: 'Pop Joy',
        badgeVariant: 'gold',
        title: 'Birthday Confetti Cannon 2-Pack',
        subtitle:
            'Compressed air party cannons loaded with biodegradable\nmetallic sparkle slow-fall dots.',
        addPrice: '+£8.50',
    },
    {
        tileBg: '#fef7ff',
        badgeLabel: 'Keepsake',
        badgeVariant: 'rose',
        title: 'Luxury Keepsake Presentation Card',
        subtitle:
            'Upgrade to an oversized 400gsm gold-embossed\nkeepsake card in an organza pouch.',
        addPrice: '+£3.00',
    },
];

/**
 * "Party Pairings / Frequently Ordered Together" section rendered
 * below the main 2-column configurator. Three product upsell cards
 * with a bulk "Add All 3" action in the header.
 *
 * @example
 * <FigmaProductUpsell
 *   eyebrow="PARTY PAIRINGS"
 *   title="Frequently Ordered Together"
 * />
 */
export function FigmaProductUpsell({
    eyebrow = 'PARTY PAIRINGS',
    title = 'Frequently Ordered Together',
    subtitle = 'Elevate your surprise moment with coordinated balloon bouquets and celebration party accessories.',
    addAllLabel = 'Add All 3 to Basket (+£27.50)',
    products = defaultProducts,
    className,
    id,
}: FigmaProductUpsellProps) {
    return (
        <section
            id={id}
            className={cn(
                'flex w-full flex-col items-start gap-6 px-10 py-10',
                className,
            )}
            style={{ maxWidth: '1280px' }}
            aria-labelledby="product-upsell-heading"
        >
            <div className="flex w-full items-start justify-between gap-4 self-stretch">
                <div className="flex w-[768px] flex-col items-start gap-3">
                    <p className="text-[12px] leading-4 font-bold tracking-[0.6px] text-popjoy-purple uppercase">
                        {eyebrow}
                    </p>
                    <h2
                        id="product-upsell-heading"
                        className="font-plus-jakarta text-[32px] leading-[38px] font-bold tracking-[-0.8px] text-popjoy-ink"
                    >
                        {title}
                    </h2>
                    <p className="text-[13px] leading-[18px] text-popjoy-muted">
                        {subtitle}
                    </p>
                </div>
                <a
                    href="#"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-popjoy-purple px-5 py-3 text-white transition hover:opacity-90"
                    style={{
                        boxShadow:
                            '0px 10px 15px -3px rgba(99,14,212,0.25), 0px 4px 6px -4px rgba(99,14,212,0.25)',
                    }}
                >
                    <img
                        src="/figma-img/mui8gto1-svzwlns.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                    />
                    <span className="font-plus-jakarta text-[14px] leading-[18px] font-semibold tracking-[0.14px]">
                        {addAllLabel}
                    </span>
                </a>
            </div>

            <div className="grid w-full grid-cols-3 gap-6">
                {products.slice(0, 3).map((product, i) => (
                    <UpsellCard key={`upsell-${i}`} product={product} />
                ))}
            </div>
        </section>
    );
}

function UpsellCard({ product }: { product: FigmaUpsellProduct }) {
    const badgeClass =
        product.badgeVariant === 'purple'
            ? 'bg-popjoy-purple/90 text-white'
            : product.badgeVariant === 'gold'
              ? 'bg-popjoy-gold text-popjoy-gold-ink'
              : 'bg-[#fecdd3] text-[#9f1239]';

    return (
        <article className="flex flex-col items-start gap-3 rounded-3xl border border-popjoy-divider/30 bg-white p-4 transition hover:border-popjoy-purple-surface">
            <div
                className="relative flex h-[180px] w-full items-center justify-center overflow-hidden rounded-2xl"
                style={{ background: product.tileBg || '#f9f1ff' }}
            >
                {product.imageSrc ? (
                    <img
                        src={product.imageSrc}
                        alt={product.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <img
                        src="/figma-img/mui8bfpc-55cis7u.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-24 w-24 opacity-50"
                    />
                )}
                <span
                    className={cn(
                        'absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] uppercase',
                        badgeClass,
                    )}
                >
                    {product.badgeLabel}
                </span>
            </div>
            <div className="flex flex-col items-start gap-2 self-stretch px-1">
                <h3 className="font-plus-jakarta text-[18px] leading-6 font-bold text-popjoy-ink">
                    {product.title}
                </h3>
                <p className="text-[12px] leading-[16px] text-popjoy-muted">
                    {product.subtitle.split('\n').map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < product.subtitle.split('\n').length - 1 && (
                                <br />
                            )}
                        </span>
                    ))}
                </p>
            </div>
            <div className="mt-2 flex w-full items-center justify-between px-1">
                <p className="font-plus-jakarta text-[18px] leading-6 font-bold tracking-[-0.2px] text-popjoy-purple">
                    {product.addPrice}
                </p>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-popjoy-gold px-4 py-2 text-popjoy-gold-ink transition hover:opacity-90"
                >
                    <img
                        src="/figma-img/mui8gto2-x4l7mq5.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-[14px] w-[14px] shrink-0"
                    />
                    <span className="text-[12px] leading-[16px] font-semibold tracking-[0.24px]">
                        Add to Order
                    </span>
                </button>
            </div>
        </article>
    );
}
