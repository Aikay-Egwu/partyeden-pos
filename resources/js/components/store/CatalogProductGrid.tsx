import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CatalogProductBadge =
    | 'Top Bestseller'
    | 'Showstopper'
    | 'Personalise Me'
    | 'New Release'
    | 'Trending'
    | 'Popular'
    | 'Easy DIY Kit'
    | 'Black Tie Chic';

export type CatalogProductOverlayIcon =
    | 'float'
    | '3ft-sphere'
    | 'feathers'
    | 'baby-shower'
    | '7-balloon'
    | 'sweet-16'
    | 'pump-dots'
    | 'chrome-silver';

export type CatalogProductVariantStyle =
    | 'inflated-diy-switcher'
    | 'tassel-bow-switcher'
    | 'custom-text-preview'
    | 'theme-pills'
    | 'colorway-dots'
    | 'digit-switcher'
    | 'air-fill-pill'
    | 'age-chips';

export type CatalogProductColorDot = {
    color: string;
};

export type CatalogProductThemeChip = {
    label: string;
    active?: boolean;
};

export type CatalogProductVariants = {
    style: CatalogProductVariantStyle;
    /** For switcher-style variants (inflated/diy, tassel/bow, digit): left = active pill */
    switcherActive?: string;
    switcherInactive?: string;
    /** For custom-text-preview: caption + purple "Live Preview" text */
    customTextCaption?: string;
    customTextAction?: string;
    /** For theme pills: array of chip labels */
    themeLabel?: string;
    themeChips?: CatalogProductThemeChip[];
    /** For colorway dots: array of dot colors */
    colorwayLabel?: string;
    colorwayDots?: CatalogProductColorDot[];
    colorwayMore?: string;
    /** For age chips: label + chip labels */
    ageLabel?: string;
    ageChips?: CatalogProductThemeChip[];
    /** For single pill styles */
    singlePillLabel?: string;
};

export type CatalogProduct = {
    id: string;
    imageSrc: string;
    imageAlt: string;
    /** Top-left chip badge (optionally with feather icon for Personalise Me) */
    badge: CatalogProductBadge;
    /** Bottom overlay left icon identifier */
    overlayIcon: CatalogProductOverlayIcon;
    /** Bottom overlay left purple text, e.g. "Floats 10–14 Days" */
    overlayPrimary: string;
    /** Bottom overlay right muted text, e.g. "Weights Included" */
    overlaySecondary: string;
    /** 0..5 rating, e.g. 4.9. Controls star SVGs (5th partial for 4.8) */
    rating: number;
    /** Number displayed next to rating, e.g. "420" */
    reviewCount: number;
    /** Display name (truncated with ellipsis if too long) */
    title: string;
    /** Short description (line-clamp 2 lines) */
    description: string;
    /** Per-product variant selector area */
    variants: CatalogProductVariants;
    /** Price, e.g. "£48.00" */
    price: string;
    /** Small line beneath price, e.g. "Free delivery slot" */
    deliveryLine: string;
    /** Optional small tag right of price, e.g. "18th/21st", "Free Box" */
    tagRight?: string;
    /** Gold pill label, e.g. "Quick Customise", "Customise", "Customise Vinyl" */
    goldButtonLabel: string;
    /** Purple pill label, e.g. "Add Pre-Set", "Add to Basket", "Add DIY Kit" */
    purpleButtonLabel: string;
    /** Whether the purple button uses the "cart" SVG variant or other icon */
    purpleButtonIcon?: 'cart' | 'cart-alt' | 'diy';
};

export type CatalogProductGridProps = {
    products?: CatalogProduct[];
    showingText?: string;
    loadMoreLabel?: string;
    className?: string;
    id?: string;
};

const img = (name: string) => `/figma-img/${name}`;

const defaultProducts: CatalogProduct[] = [
    {
        id: 'card1',
        imageSrc: img('mui8bfq8-zskixl3.png'),
        imageAlt: 'Pastel Sunset Number 18 Stack balloon',
        badge: 'Top Bestseller',
        overlayIcon: 'float',
        overlayPrimary: 'Floats 10–14 Days',
        overlaySecondary: 'Weights Included',
        rating: 4.9,
        reviewCount: 420,
        title: 'The Pastel Sunset Number 18',
        description:
            'Giant 34" gradient numbers on bespoke tiered balloon plinth with luxury satin ribbon & weights.',
        variants: {
            style: 'inflated-diy-switcher',
            switcherActive: 'Inflated in Box',
            switcherInactive: 'DIY Flat Pack (-£10)',
        },
        price: '£48.00',
        deliveryLine: 'Free delivery slot',
        tagRight: '18th/21st',
        goldButtonLabel: 'Quick Customise',
        purpleButtonLabel: 'Add Pre-Set',
        purpleButtonIcon: 'cart-alt',
    },
    {
        id: 'card2',
        imageSrc: img('mui8bfq8-cl90fx1.png'),
        imageAlt: 'Giant Champagne Tassel Orb balloon',
        badge: 'Showstopper',
        overlayIcon: '3ft-sphere',
        overlayPrimary: '3ft Sphere',
        overlaySecondary: 'Extra High Float',
        rating: 4.9,
        reviewCount: 340,
        title: 'Giant Champagne Tassel Orb',
        description:
            '3ft spherical metallic champagne orb balloon with an opulent cascading foil & satin tassel streamer.',
        variants: {
            style: 'tassel-bow-switcher',
            switcherActive: 'With Tassel Streamer',
            switcherInactive: 'Simple Satin Bow (-£5)',
        },
        price: '£38.00',
        deliveryLine: 'Delivered Inflated',
        goldButtonLabel: 'Customise',
        purpleButtonLabel: 'Add Pre-Set',
        purpleButtonIcon: 'cart-alt',
    },
    {
        id: 'card3',
        imageSrc: img('mui8bfq8-e9dhtsw.png'),
        imageAlt: 'Bespoke Feather Crystal Bubble balloon',
        badge: 'Personalise Me',
        overlayIcon: 'feathers',
        overlayPrimary: 'Real Goose Feathers',
        overlaySecondary: '14 Day Float',
        rating: 5.0,
        reviewCount: 612,
        title: 'Bespoke Feather Crystal Bubble',
        description:
            '24" high-clarity bubble with fluffy goose down feathers, custom cursive vinyl lettering & satin bow.',
        variants: {
            style: 'custom-text-preview',
            customTextCaption: 'Includes 45 chars custom text',
            customTextAction: 'Live Preview',
        },
        price: '£34.99',
        deliveryLine: 'Pre-inflated',
        tagRight: 'Free Box',
        goldButtonLabel: 'Customise Vinyl',
        purpleButtonLabel: 'Add to Basket',
        purpleButtonIcon: 'cart',
    },
    {
        id: 'card4',
        imageSrc: img('mui8bfq8-h10ii7a.png'),
        imageAlt: 'Luxury Baby Shower Cloud balloon',
        badge: 'New Release',
        overlayIcon: 'baby-shower',
        overlayPrimary: 'Baby Shower & Reveal',
        overlaySecondary: 'Free Gift Tag',
        rating: 5.0,
        reviewCount: 215,
        title: 'Luxury Baby Shower Cloud &',
        description:
            'Pastel sage, warm milk & honey yellow cloud plinth crowned with a customisable foil letter set.',
        variants: {
            style: 'theme-pills',
            themeLabel: 'Theme:',
            themeChips: [
                { label: 'Welcome Baby', active: true },
                { label: 'Gender Neutral', active: false },
            ],
        },
        price: '£44.00',
        deliveryLine: 'In High Demand',
        goldButtonLabel: 'Customise',
        purpleButtonLabel: 'Add Pre-Set',
        purpleButtonIcon: 'cart-alt',
    },
    {
        id: 'card5',
        imageSrc: img('mui8bfq8-rluql1q.png'),
        imageAlt: 'Chrome Gold & Royal Purple Cluster balloon',
        badge: 'Trending',
        overlayIcon: '7-balloon',
        overlayPrimary: '7-Balloon Cluster',
        overlaySecondary: 'Table or Floor',
        rating: 4.8,
        reviewCount: 189,
        title: 'Chrome Gold & Royal Purple Cluster',
        description:
            '7-piece luxury helium bouquet mixing mirror chrome gold, deep royal violet, and pearl latex.',
        variants: {
            style: 'colorway-dots',
            colorwayLabel: 'Colorways:',
            colorwayDots: [
                { color: '#630ED4' },
                { color: '#FDC425' },
                { color: '#BF2076' },
            ],
            colorwayMore: '+3 more',
        },
        price: '£42.00',
        deliveryLine: 'Next Day Ready',
        goldButtonLabel: 'Quick Customise',
        purpleButtonLabel: 'Add to Basket',
        purpleButtonIcon: 'cart-alt',
    },
    {
        id: 'card6',
        imageSrc: img('mui8bfq8-x141td4.png'),
        imageAlt: 'Sweet 16 Rose Gold Glam balloon',
        badge: 'Popular',
        overlayIcon: 'sweet-16',
        overlayPrimary: 'Sweet 16 & 18',
        overlaySecondary: 'Free Personalisation',
        rating: 4.9,
        reviewCount: 178,
        title: 'Sweet 16 Rose Gold Glam Stack',
        description:
            'Double-digit 34" foil numbers in mirror rose gold sitting on a sturdy organic mini balloon plinth.',
        variants: {
            style: 'digit-switcher',
            switcherActive: 'Double Digit (16)',
            switcherInactive: 'Single Digit (-£12)',
        },
        price: '£46.50',
        deliveryLine: '14 Days Float',
        goldButtonLabel: 'Customise',
        purpleButtonLabel: 'Add Pre-Set',
        purpleButtonIcon: 'cart-alt',
    },
    {
        id: 'card7',
        imageSrc: img('mui8bfq8-t3j36qn.png'),
        imageAlt: 'Ombre Rainbow Balloon Garland Kit',
        badge: 'Easy DIY Kit',
        overlayIcon: 'pump-dots',
        overlayPrimary: 'Pump + Dots Included',
        overlaySecondary: '35 Min Setup',
        rating: 4.9,
        reviewCount: 340,
        title: 'Ombre Rainbow Balloon Garland Kit',
        description:
            'Includes 75 organic biodegradable balloons, 5m hanging line, 100 adhesive dots & air pump.',
        variants: {
            style: 'air-fill-pill',
            singlePillLabel: 'Air Fill (No Helium)',
        },
        price: '£28.50',
        deliveryLine: 'Air Fill (No Helium)',
        goldButtonLabel: 'Customise',
        purpleButtonLabel: 'Add DIY Kit',
        purpleButtonIcon: 'diy',
    },
    {
        id: 'card8',
        imageSrc: img('mui8bfq8-6a1p001.png'),
        imageAlt: 'Midnight Elegance 30th balloon',
        badge: 'Black Tie Chic',
        overlayIcon: 'chrome-silver',
        overlayPrimary: 'Chrome & Silver',
        overlaySecondary: 'Delivered Ready',
        rating: 4.8,
        reviewCount: 290,
        title: 'Midnight Elegance 30th Stack',
        description:
            'Deep violet, chrome silver & midnight black foils with a custom vinyl-lettered milestone name banner.',
        variants: {
            style: 'age-chips',
            ageLabel: 'Ages:',
            ageChips: [
                { label: '30th', active: true },
                { label: '40th', active: false },
                { label: '50th', active: false },
            ],
        },
        price: '£39.99',
        deliveryLine: 'Includes Weights',
        goldButtonLabel: 'Customise',
        purpleButtonLabel: 'Add Pre-Set',
        purpleButtonIcon: 'cart-alt',
    },
];

function badgeBg(badge: CatalogProductBadge): string {
    switch (badge) {
        case 'Top Bestseller':
            return 'bg-popjoy-gold text-popjoy-gold-ink';
        case 'Showstopper':
            return 'bg-[#BF2076] text-[#FFDDE7]';
        case 'Personalise Me':
            return 'bg-popjoy-purple-surface text-popjoy-ink';
        case 'New Release':
            return 'bg-popjoy-purple-surface text-popjoy-ink';
        case 'Trending':
            return 'bg-popjoy-purple-bg text-popjoy-purple';
        case 'Popular':
            return 'bg-popjoy-purple-bg text-popjoy-ink';
        case 'Easy DIY Kit':
            return 'bg-popjoy-gold-border text-popjoy-gold-ink';
        case 'Black Tie Chic':
            return 'bg-[#352B4D] text-[#F6EDFF]';
    }
}

function StarRow({ rating }: { rating: number }) {
    const fullStar = img('mui8bfpc-2tu7w0f.svg');
    const partialStar = img('mui8bfpe-2znn6wn.svg');
    const stars: ReactNode[] = [];
    const rounded = Math.round(rating * 10);
    const isPartial = rounded === 48;

    for (let i = 0; i < 5; i++) {
        const isLast = i === 4;
        const usePartial = isPartial && isLast;
        stars.push(
            <img
                key={i}
                src={usePartial ? partialStar : fullStar}
                alt=""
                aria-hidden="true"
                className="h-[13px] w-[13px] shrink-0"
            />,
        );
    }

    return <div className="inline-flex shrink-0 items-center">{stars}</div>;
}

function OverlayIcon({ icon }: { icon: CatalogProductOverlayIcon }) {
    const map: Record<CatalogProductOverlayIcon, string> = {
        float: 'mui8bfpc-7ec6mdl.svg',
        '3ft-sphere': 'mui8bfpe-n2nedze.svg',
        feathers: 'mui8bfpc-py88450.svg',
        'baby-shower': 'mui8bfpe-am5a42m.svg',
        '7-balloon': 'mui8bfpc-hxzkdbk.svg',
        'sweet-16': 'mui8bfpe-n7nz5dp.svg',
        'pump-dots': 'mui8bfpe-7t2qros.svg',
        'chrome-silver': 'mui8bfpf-wf433pi.svg',
    };

    return (
        <img
            src={img(map[icon])}
            alt=""
            aria-hidden="true"
            className="h-[12px] w-[12px] shrink-0"
        />
    );
}

function PersonaliseFeatherIcon() {
    return (
        <img
            src={img('mui8bfpc-n6ogg9l.svg')}
            alt=""
            aria-hidden="true"
            className="h-[10px] w-[10px] shrink-0"
        />
    );
}

function PurpleButtonIcon({
    variant,
}: {
    variant: CatalogProduct['purpleButtonIcon'];
}) {
    switch (variant) {
        case 'cart':
            return (
                <img
                    src={img('mui8bfpc-xho1vek.svg')}
                    alt=""
                    aria-hidden="true"
                    className="h-[13px] w-[15px] shrink-0"
                />
            );
        case 'diy':
            return (
                <img
                    src={img('mui8bfpe-fqs0v2l.svg')}
                    alt=""
                    aria-hidden="true"
                    className="h-[15px] w-[12px] shrink-0"
                />
            );
        case 'cart-alt':
        default:
            return (
                <img
                    src={img('mui8bfpe-dv9lc5n.svg')}
                    alt=""
                    aria-hidden="true"
                    className="h-[9px] w-[9px] shrink-0"
                />
            );
    }
}

function VariantsArea({ v }: { v: CatalogProductVariants }) {
    switch (v.style) {
        case 'inflated-diy-switcher':
        case 'tassel-bow-switcher':
        case 'digit-switcher':
            return (
                <div className="flex shrink-0 items-center justify-center self-stretch rounded-full bg-popjoy-purple-bg p-1">
                    <div className="flex flex-1 flex-col items-center rounded-full bg-white py-1">
                        <span className="text-center text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-purple">
                            {v.switcherActive}
                        </span>
                    </div>
                    <span className="flex-1 px-2 text-center text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {v.switcherInactive}
                    </span>
                </div>
            );
        case 'custom-text-preview':
            return (
                <div className="flex shrink-0 items-center justify-between self-stretch rounded-2xl bg-[#FFD9E44D] px-2 py-1">
                    <span className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-[#9B005C]">
                        {v.customTextCaption}
                    </span>
                    <span className="text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-purple underline">
                        {v.customTextAction}
                    </span>
                </div>
            );
        case 'theme-pills':
            return (
                <div className="flex shrink-0 items-center gap-[6px] self-stretch pt-1">
                    <span className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {v.themeLabel}
                    </span>
                    {v.themeChips?.map((chip, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                'inline-flex flex-col items-start rounded-full px-2 py-[2px]',
                                chip.active
                                    ? 'bg-popjoy-purple-bg'
                                    : 'bg-popjoy-bg',
                            )}
                        >
                            <span
                                className={cn(
                                    'text-[11px] leading-[14px] tracking-[0.33px]',
                                    chip.active
                                        ? 'font-semibold text-popjoy-ink'
                                        : 'font-medium text-popjoy-muted',
                                )}
                            >
                                {chip.label}
                            </span>
                        </div>
                    ))}
                </div>
            );
        case 'colorway-dots':
            return (
                <div className="flex shrink-0 items-center gap-[6px] self-stretch pt-1">
                    <span className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {v.colorwayLabel}
                    </span>
                    {v.colorwayDots?.map((dot, idx) => (
                        <div
                            key={idx}
                            className="h-[14px] w-[14px] shrink-0 rounded-full border-2 border-white shadow-[0px_1px_2px_0px_#0000000d]"
                            style={{ background: dot.color }}
                        />
                    ))}
                    {v.colorwayMore && (
                        <span className="pl-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-purple">
                            {v.colorwayMore}
                        </span>
                    )}
                </div>
            );
        case 'age-chips':
            return (
                <div className="flex shrink-0 items-center gap-[6px] self-stretch pt-1">
                    <span className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {v.ageLabel}
                    </span>
                    {v.ageChips?.map((chip, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                'inline-flex flex-col items-start rounded-full px-2 py-[2px]',
                                chip.active
                                    ? 'bg-popjoy-purple-bg'
                                    : 'bg-popjoy-bg',
                            )}
                        >
                            <span
                                className={cn(
                                    'text-[11px] leading-[14px] tracking-[0.33px]',
                                    chip.active
                                        ? 'font-semibold text-popjoy-ink'
                                        : 'font-medium text-popjoy-muted',
                                )}
                            >
                                {chip.label}
                            </span>
                        </div>
                    ))}
                </div>
            );
        case 'air-fill-pill':
            return (
                <div className="flex shrink-0 items-center gap-2 self-stretch pt-1">
                    <div className="inline-flex flex-col items-start rounded-2xl bg-popjoy-purple-bg px-2 py-[2px]">
                        <span className="text-[11px] leading-[14px] font-semibold tracking-[0.33px] text-popjoy-ink">
                            {v.singlePillLabel}
                        </span>
                    </div>
                    <div className="inline-flex flex-col items-start rounded-2xl bg-popjoy-bg px-2 py-[2px]">
                        <span className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                            4 Metres (£44.00)
                        </span>
                    </div>
                </div>
            );
    }
}

type CardProps = {
    product: CatalogProduct;
    index: number;
};

function CatalogProductCard({ product, index }: CardProps) {
    void index;
    const cardId = `catalog-product-${product.id}`;

    return (
        <article
            id={cardId}
            aria-labelledby={`${cardId}-title`}
            className="flex flex-col items-center self-stretch rounded-[32px] bg-white"
        >
            <div
                className={cn(
                    'flex flex-1 flex-col items-center self-stretch rounded-[32px] bg-white p-3',
                    'shadow-[0px_4px_16px_-2px_#7C3AED0F]',
                )}
            >
                <div className="flex flex-col items-start gap-1 self-stretch">
                    <div className="relative flex shrink-0 items-center self-stretch overflow-hidden rounded-2xl bg-popjoy-purple-bg">
                        <div className="relative flex flex-1 items-center overflow-hidden p-2">
                            <img
                                src={product.imageSrc}
                                alt={product.imageAlt}
                                className="h-[220px] w-full object-cover"
                                style={{ backgroundPosition: '-108px 0px' }}
                            />
                            <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
                                <div
                                    className={cn(
                                        'inline-flex flex-col items-start rounded-full px-2 py-[2px] text-[11px] leading-[17px] font-bold shadow-[0px_1px_2px_0px_#0000000d]',
                                        badgeBg(product.badge),
                                    )}
                                >
                                    <div className="inline-flex items-center gap-1">
                                        {product.badge === 'Personalise Me' && (
                                            <PersonaliseFeatherIcon />
                                        )}
                                        <span>{product.badge}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Add to wishlist"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-popjoy-bg/80 backdrop-blur-md"
                                >
                                    <img
                                        src={img('mui8bfpc-55cis7u.svg')}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-[14px] w-[15px] shrink-0"
                                    />
                                </button>
                            </div>
                            <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between self-stretch rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
                                <div className="inline-flex shrink-0 items-center gap-1">
                                    <OverlayIcon icon={product.overlayIcon} />
                                    <span className="text-[11px] leading-[17px] text-popjoy-purple">
                                        {product.overlayPrimary}
                                    </span>
                                </div>
                                <span className="text-[11px] leading-[17px] font-medium text-popjoy-muted">
                                    {product.overlaySecondary}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 self-stretch pt-2">
                        <StarRow rating={product.rating} />
                        <span className="text-sm leading-4 font-bold tracking-[0.24px] text-popjoy-ink">
                            {product.rating.toFixed(1)}
                        </span>
                        <span className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                            ({product.reviewCount})
                        </span>
                    </div>
                    <h3
                        id={`${cardId}-title`}
                        className="shrink-0 self-stretch truncate overflow-hidden font-plus-jakarta text-[18px] leading-6 font-semibold whitespace-nowrap text-popjoy-ink"
                    >
                        {product.title}
                    </h3>
                    <div className="flex shrink-0 flex-col items-start gap-1 self-stretch pb-1">
                        <p
                            className="line-clamp-2 shrink-0 self-stretch text-[13px] leading-[18px] text-popjoy-muted"
                            style={{
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {product.description}
                        </p>
                    </div>
                    <VariantsArea v={product.variants} />
                </div>
                <div className="mt-4 flex shrink-0 flex-col items-start self-stretch border-t border-popjoy-purple-bg/70 pt-[7px]">
                    <div className="flex items-start justify-between gap-2 self-stretch">
                        <div className="flex items-baseline gap-[9px] pb-0.5">
                            <span className="font-plus-jakarta text-[22px] leading-7 font-extrabold text-popjoy-ink">
                                {product.price}
                            </span>
                            <span className="mt-3 text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                                {product.deliveryLine}
                            </span>
                        </div>
                        {product.tagRight && (
                            <span
                                className={cn(
                                    'mt-[11px] text-xs leading-4 font-bold tracking-[0.24px]',
                                    product.badge === 'New Release' ||
                                        product.tagRight === '14 Days Float' ||
                                        product.tagRight === 'Next Day Ready'
                                        ? 'text-popjoy-purple'
                                        : product.tagRight === 'In High Demand'
                                          ? 'text-popjoy-gold-ink'
                                          : 'text-popjoy-purple',
                                )}
                            >
                                {product.tagRight}
                            </span>
                        )}
                    </div>
                    <div className="flex shrink-0 items-start gap-1 self-stretch pt-2">
                        <button
                            type="button"
                            className="inline-flex shrink-0 flex-col items-center justify-center rounded-full bg-popjoy-gold px-3 py-1"
                        >
                            <span className="text-xs leading-4 font-bold tracking-[0.24px] text-popjoy-gold-ink">
                                {product.goldButtonLabel}
                            </span>
                        </button>
                        <button
                            type="button"
                            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-popjoy-purple-soft px-4 py-1"
                        >
                            <PurpleButtonIcon
                                variant={product.purpleButtonIcon ?? 'cart-alt'}
                            />
                            <span className="text-xs leading-4 font-bold tracking-[0.24px] text-white">
                                {product.purpleButtonLabel}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

/**
 * 8-product catalog grid + load-more progress tracker that matches the Figma
 * `.sectionMainProductLi .container78 + .progressTrackerLoadM` specification.
 *
 * Responsive layout: 2 columns on `lg`, 4 columns on `xl` with a 64px gap
 * between rows and 24px between columns. Each product renders a
 * `CatalogProductCard` (image with badges + glass overlay, rating stars,
 * title, 2-line description, variant area, divider, price row with gold
 * customise pill and purple add-to-basket pill).
 *
 * Below the grid: a 24px-tall progress bar (purple fill on a soft purple
 * track), the "Showing X of Y celebration packages" count, and a white
 * pill "Load 16 More Balloons" button with a reload icon.
 *
 * @example
 * <CatalogProductGrid />
 */
export function CatalogProductGrid({
    products = defaultProducts,
    showingText = 'Showing 8 of 48 celebration packages',
    loadMoreLabel = 'Load 16 More Balloons',
    className,
    id,
}: CatalogProductGridProps) {
    const headingId = id ? `${id}-heading` : 'catalog-grid-heading';
    const sectionId = id ? `${id}-section` : 'catalog-grid-section';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start bg-popjoy-bg px-10 pt-6 pb-16',
                className,
            )}
        >
            <h2 id={headingId} className="sr-only">
                Celebration Packages Catalog
            </h2>

            <div className="flex shrink-0 items-start justify-between self-stretch">
                <div className="grid w-full grid-cols-2 gap-x-6 gap-y-16 lg:grid-cols-2 xl:grid-cols-4">
                    {products.map((product, idx) => (
                        <CatalogProductCard
                            key={`${product.id}-${idx}`}
                            product={product}
                            index={idx}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-16 flex w-full shrink-0 flex-col items-center justify-center self-stretch">
                <div className="mb-2 flex w-full max-w-[448px] shrink-0 flex-col items-start self-stretch pb-2">
                    <div className="flex shrink-0 items-center self-stretch overflow-hidden rounded-full bg-popjoy-purple-bg pr-[372px]">
                        <div className="h-[10px] w-[76px] shrink-0 rounded-full bg-popjoy-purple-soft" />
                    </div>
                </div>
                <p className="shrink-0 pb-3 text-[11px] leading-[14px] tracking-[0.33px] text-popjoy-muted">
                    <span className="font-medium">{showingText}</span>
                </p>
                <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-10 py-3 shadow-[0px_4px_16px_0px_#630ED41F]"
                >
                    <img
                        src={img('mui8bfpf-wcjgkng.svg')}
                        alt=""
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                    />
                    <span className="text-sm leading-[18px] font-bold tracking-[0.14px] text-popjoy-purple">
                        {loadMoreLabel}
                    </span>
                </button>
            </div>
        </section>
    );
}
