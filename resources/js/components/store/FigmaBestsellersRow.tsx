import { Link } from '@inertiajs/react';
import { ArrowRight, ShoppingBag, Sparkles, Star } from 'lucide-react';

import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

/**
 * Normalised product item shape for the bestsellers grid.
 */
export type FigmaBestsellerItem = {
    id?: string;
    href?: string;
    title: string;
    subtitle: string;
    price: string | number;
    optionTag?: string;
    imageSrc?: string | null;
    imageAlt?: string;
    tileBg?: string;
    badgeLabel?: string;
    badgeVariant?: 'bestseller' | 'personalise' | 'trending' | 'diy';
    rating?: number;
    ratingMeta?: string;
};

/**
 * Dynamic backend product shape from StoreHomeController.
 */
export type StoreProductSummary = {
    id: string;
    name: string;
    sku?: string;
    selling_price: string | number;
    product_type?: string;
    is_active?: boolean;
    category?: { id: string; name: string } | null;
    primary_image?: string | null;
};

export type FigmaBestsellersRowProps = {
    /** Optional section title */
    title?: string;
    /** Optional eyebrow pill label */
    eyebrow?: string;
    /** Optional section description */
    description?: string;
    /** Products list — accepts database products or custom items */
    products?: (StoreProductSummary | FigmaBestsellerItem)[];
    /** Optional additional className */
    className?: string;
    /** Optional section ID */
    id?: string;
};

const pastelBackgrounds = [
    '#fbf5ff',
    '#fff9eb',
    '#f2efff',
    '#fdf2f8',
    '#f0fdf4',
];

const defaultFallbackProducts: FigmaBestsellerItem[] = [
    {
        title: 'The Pastel Sunset Number Stack',
        subtitle: 'Includes helium, weights & satin ribbon',
        price: '48.00',
        optionTag: 'Inflated In Giant Box',
        tileBg: '#fbf5ff',
        badgeLabel: 'Bestseller',
        badgeVariant: 'bestseller',
        rating: 5,
        ratingMeta: '4.9 (320 reviews)',
        imageSrc: '/images/home-page.jpg',
        imageAlt: 'Pastel Sunset Number Stack balloon display',
        href: '/products',
    },
    {
        title: 'Bespoke Feather Confetti Crystal Bubble',
        subtitle: 'Personalised text · 10 font choices',
        price: '34.99',
        optionTag: 'Floats 10–14 Days',
        tileBg: '#fff9eb',
        badgeLabel: 'Personalise Me',
        badgeVariant: 'personalise',
        rating: 5,
        ratingMeta: '4.9 (540 reviews)',
        imageSrc: '/images/home-page.jpg',
        imageAlt: 'Bespoke Feather Confetti Crystal Bubble',
        href: '/products',
    },
    {
        title: 'Chrome Gold & Royal Purple Cluster',
        subtitle: 'Bouquet of 7 high-shine foil balloons',
        price: '42.00',
        optionTag: 'Inflated In Giant Box',
        tileBg: '#f2efff',
        badgeLabel: 'Trending',
        badgeVariant: 'trending',
        rating: 5,
        ratingMeta: '4.8 (195 reviews)',
        imageSrc: '/images/home-page.jpg',
        imageAlt: 'Chrome Gold & Royal Purple Cluster',
        href: '/products',
    },
    {
        title: 'Ombre Rainbow Balloon Garland Kit',
        subtitle: 'Choose 2m or 4m · 65+ balloons',
        price: '28.50',
        optionTag: 'Complete DIY Party Kit',
        tileBg: '#fdf2f8',
        badgeLabel: 'Easy DIY',
        badgeVariant: 'diy',
        rating: 5,
        ratingMeta: '4.9 (410 reviews)',
        imageSrc: '/images/home-page.jpg',
        imageAlt: 'Ombre Rainbow Balloon Garland Kit',
        href: '/products',
    },
];

function badgeClasses(variant?: FigmaBestsellerItem['badgeVariant']) {
    switch (variant) {
        case 'personalise':
            return 'bg-popjoy-purple text-white shadow-sm';
        case 'trending':
            return 'bg-popjoy-gold text-popjoy-gold-ink font-bold shadow-sm';
        case 'diy':
            return 'bg-popjoy-purple-surface text-popjoy-purple font-bold border border-popjoy-purple/20';
        case 'bestseller':
        default:
            return 'bg-popjoy-purple text-white shadow-sm';
    }
}

/**
 * Normalises an input product (database model or custom item) to FigmaBestsellerItem.
 */
function normalizeProduct(
    product: StoreProductSummary | FigmaBestsellerItem,
    index: number,
): FigmaBestsellerItem {
    if ('title' in product) {
        return {
            ...product,
            tileBg:
                product.tileBg ??
                pastelBackgrounds[index % pastelBackgrounds.length],
            rating: product.rating ?? 5,
            ratingMeta: product.ratingMeta ?? '5.0 (100% pure helium)',
            optionTag: product.optionTag ?? 'Inflated In Box',
        };
    }

    const defaultBadges: FigmaBestsellerItem['badgeVariant'][] = [
        'bestseller',
        'personalise',
        'trending',
        'diy',
    ];

    return {
        id: product.id,
        href: `/products/${product.id}`,
        title: product.name,
        subtitle: product.category?.name ?? 'Luxury Inflated Arrangement',
        price: product.selling_price,
        optionTag: '10–14 Day High Float',
        imageSrc: product.primary_image,
        imageAlt: product.name,
        tileBg: pastelBackgrounds[index % pastelBackgrounds.length],
        badgeLabel:
            index === 0 ? 'Bestseller' : index === 1 ? 'Trending' : undefined,
        badgeVariant: defaultBadges[index % defaultBadges.length],
        rating: 5,
        ratingMeta: '4.9 · Handcrafted',
    };
}

/**
 * Elegant bestsellers product row.
 * Displays curated cards with pastel backdrops, star ratings, tags, and shop actions.
 */
export function FigmaBestsellersRow({
    title = 'Trending Bestsellers',
    eyebrow = 'CUSTOMER FAVOURITES',
    description = 'Handcrafted balloon bouquets, personalised bubbles, and ready-to-party installations.',
    products,
    className,
    id = 'bestsellers',
}: FigmaBestsellersRowProps) {
    const rawList =
        products && products.length > 0 ? products : defaultFallbackProducts;
    const items = rawList.slice(0, 4).map(normalizeProduct);

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className={cn(
                'w-full bg-popjoy-bg px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20',
                className,
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:gap-10">
                {/* Header row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex max-w-2xl flex-col gap-2">
                        <div className="inline-flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-popjoy-purple" />
                            <span className="font-sans text-xs font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                                {eyebrow}
                            </span>
                        </div>
                        <h2
                            id={`${id}-heading`}
                            className="font-plus-jakarta text-2xl font-extrabold tracking-tight text-popjoy-ink sm:text-3xl lg:text-4xl"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p className="font-sans text-sm text-popjoy-muted sm:text-base">
                                {description}
                            </p>
                        )}
                    </div>

                    <Link
                        href="/products"
                        className="inline-flex shrink-0 items-center gap-1.5 font-plus-jakarta text-sm font-bold text-popjoy-purple transition-colors hover:text-popjoy-purple-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-popjoy-purple"
                    >
                        <span>View all collections</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>

                {/* 4-column product card grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {items.map((item, index) => {
                        const targetHref =
                            item.href ??
                            (item.id ? `/products/${item.id}` : '/products');

                        return (
                            <article
                                key={`${item.title}-${index}`}
                                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-popjoy-divider/50 bg-white p-4 shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-popjoy-purple hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex flex-col gap-3">
                                    {/* Visual preview tile */}
                                    <Link
                                        href={targetHref}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl transition-colors"
                                        style={{ background: item.tileBg }}
                                    >
                                        {/* Badge pill */}
                                        {item.badgeLabel && (
                                            <div
                                                className={cn(
                                                    'absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 font-sans text-[10px] leading-tight font-bold tracking-wide uppercase',
                                                    badgeClasses(
                                                        item.badgeVariant,
                                                    ),
                                                )}
                                            >
                                                {item.badgeLabel}
                                            </div>
                                        )}

                                        {item.imageSrc ? (
                                            <img
                                                src={item.imageSrc}
                                                alt={
                                                    item.imageAlt ?? item.title
                                                }
                                                className="h-full w-full object-cover p-3 transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-2 text-popjoy-muted">
                                                <ShoppingBag className="h-10 w-10 stroke-1 text-popjoy-purple/40" />
                                                <span className="font-sans text-xs font-medium">
                                                    Party Eden Luxe
                                                </span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Star rating */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map(
                                                (_, starIndex) => (
                                                    <Star
                                                        key={starIndex}
                                                        className="h-3.5 w-3.5 fill-popjoy-gold text-popjoy-gold"
                                                        aria-hidden="true"
                                                    />
                                                ),
                                            )}
                                        </div>
                                        <span className="font-sans text-xs font-medium text-popjoy-muted">
                                            {item.ratingMeta}
                                        </span>
                                    </div>

                                    {/* Product title */}
                                    <h3 className="font-plus-jakarta text-base font-bold text-popjoy-ink transition-colors group-hover:text-popjoy-purple">
                                        <Link
                                            href={targetHref}
                                            className="focus:outline-none"
                                        >
                                            {item.title}
                                        </Link>
                                    </h3>

                                    {/* Subtitle / features */}
                                    <p className="line-clamp-2 font-sans text-xs leading-relaxed text-popjoy-muted">
                                        {item.subtitle}
                                    </p>
                                </div>

                                {/* Bottom strip: Price & Action CTA */}
                                <div className="mt-4 pt-3">
                                    <div className="flex items-center justify-between rounded-2xl border border-popjoy-divider/40 bg-popjoy-bg px-3.5 py-2.5">
                                        <div className="flex flex-col">
                                            <span className="font-plus-jakarta text-base font-extrabold text-popjoy-ink">
                                                {typeof item.price ===
                                                    'number' ||
                                                !item.price
                                                    .toString()
                                                    .startsWith('£')
                                                    ? formatCurrency(item.price)
                                                    : item.price}
                                            </span>
                                            <span className="font-sans text-[10px] font-medium text-popjoy-muted">
                                                {item.optionTag}
                                            </span>
                                        </div>

                                        <Link
                                            href={targetHref}
                                            aria-label={`View ${item.title}`}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-popjoy-purple text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple active:scale-95"
                                        >
                                            <ShoppingBag
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
