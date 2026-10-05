import { Head, Link, usePage } from '@inertiajs/react';
import { ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { CookieConsent } from '@/components/store/cookie-consent';
//import { FigmaAnnouncementBar } from '@/components/store/FigmaAnnouncementBar';
import { FigmaFooter } from '@/components/store/FigmaFooter';
import { FigmaHeader } from '@/components/store/FigmaHeader';
import { formatCurrency } from '@/lib/currency';

type StoreProduct = {
    id: string;
    name: string;
    sku: string;
    selling_price: string;
    product_type: string;
    is_active: boolean;
    category: { id: string; name: string } | null;
    primary_image: string | null;
};

type CatalogOption = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    products: {
        data: StoreProduct[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    categories: CatalogOption[];
    occasions: CatalogOption[];
    filters: {
        search: string;
        category: string;
        occation: string;
        sort: string;
    };
};

export default function ProductListing({
    products,
    categories,
    occasions,
    filters,
}: Props) {
    const selectedCategory = categories.find(
        (category) => category.slug === filters.category,
    );
    const selectedOccasion = occasions.find(
        (occasion) => occasion.slug === filters.occation,
    );
    const pageProps = usePage().props as unknown as {
        cart?: {
            items?: Array<{
                line_key: string;
                product_id: string;
                variant_id: string | null;
                name: string;
                variant_name: string | null;
                price: string;
                quantity: number;
                image?: string | null;
                customization_text?: string | null;
                customization_primary_color?: {
                    name: string;
                    hex_code?: string | null;
                } | null;
                customization_secondary_color?: {
                    name: string;
                    hex_code?: string | null;
                } | null;
                add_ons?: Array<{ id: string; name: string; price?: string }>;
            }>;
            count: number;
            total: string;
        };
    };
    const cart = pageProps.cart;
    const [cartOpen, setCartOpen] = useState(false);

    // Filter panel is collapsed by default on mobile so products are visible
    // without scrolling; always expanded on desktop (lg+ via CSS).
    const [filtersOpen, setFiltersOpen] = useState(false);
    const activeFilterCount = [
        filters.search,
        filters.category,
        filters.occation,
    ].filter(Boolean).length;

    return (
        <>
            <Head title="Shop balloons — Party Eden" />

            <a
                href="#catalog-main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded focus:bg-popjoy-purple focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to products
            </a>

            {/* <FigmaAnnouncementBar /> */}
            <FigmaHeader onCartClick={() => setCartOpen(true)} />
            <main
                id="catalog-main"
                className="store-light min-h-screen w-full bg-popjoy-bg text-popjoy-ink"
            >
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-2 text-sm text-popjoy-muted"
                    >
                        <Link
                            href="/"
                            className="hover:text-popjoy-purple focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                        >
                            Home
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page" className="text-popjoy-ink">
                            Shop balloons
                        </span>
                    </nav>

                    <header className="mt-8 hidden rounded-4xl bg-linear-to-br from-[#efe2ff] via-[#f8f2ff] to-[#fff4d9] px-3 py-5 sm:px-10 sm:py-14 md:block">
                        <p className="text-xs font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                            THE PARTY EDEN COLLECTION
                        </p>
                        <h1 className="mt-3 max-w-3xl font-plus-jakarta text-3xl leading-tight font-bold text-popjoy-ink sm:text-4xl">
                            Balloons for the moments that matter
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-popjoy-muted sm:text-base">
                            Explore handcrafted styles for birthdays, new
                            arrivals, weddings and every reason to celebrate.
                        </p>
                    </header>
                </div>

                <section
                    id="catalog-categories"
                    aria-label="Browse balloon categories"
                    className="px-5 py-8 sm:px-8 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <h2 className="font-plus-jakarta text-xl font-semibold">
                            Browse categories
                        </h2>
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                            <Link
                                href="/products"
                                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple ${
                                    !filters.category
                                        ? 'bg-popjoy-purple text-white'
                                        : 'bg-white text-popjoy-ink hover:bg-popjoy-purple-bg'
                                }`}
                            >
                                All balloons
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                                    aria-current={
                                        selectedCategory?.id === category.id
                                            ? 'page'
                                            : undefined
                                    }
                                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple ${
                                        selectedCategory?.id === category.id
                                            ? 'bg-popjoy-purple text-white'
                                            : 'bg-white text-popjoy-ink hover:bg-popjoy-purple-bg'
                                    }`}
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="catalog-filters"
                    aria-label="Filter balloons"
                    className="px-5 py-4 sm:px-8 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl rounded-3xl bg-white p-4 shadow-[0_4px_20px_-2px_rgba(99,14,212,0.08)]">
                        {/* Mobile-only toggle: keeps the filter panel collapsed
                            so products are reachable without long scrolling. */}
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="catalog-filter-fields"
                            className="flex w-full items-center justify-between rounded-xl border border-popjoy-divider px-4 py-3 text-sm font-bold text-popjoy-ink lg:hidden"
                        >
                            <span className="flex items-center gap-2">
                                <SlidersHorizontal
                                    aria-hidden="true"
                                    className="size-4 text-popjoy-purple"
                                />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-popjoy-purple text-[11px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </span>
                            <span
                                aria-hidden="true"
                                className={`text-popjoy-muted transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                            >
                                ▾
                            </span>
                        </button>

                        <form
                            action="/products"
                            method="get"
                            className="lg:grid lg:grid-cols-[minmax(14rem,2fr)_1fr_1fr_1fr_auto_auto] lg:items-end lg:gap-3"
                        >
                            {/* On desktop the wrapper dissolves (display:contents)
                                so fields flow directly into the form grid;
                                on mobile it collapses behind the Filters toggle. */}
                            <div
                                id="catalog-filter-fields"
                                className={`${
                                    filtersOpen
                                        ? 'mt-3 grid gap-3 sm:grid-cols-2'
                                        : 'hidden'
                                } lg:contents`}
                            >
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-popjoy-muted">
                                    Search balloons
                                    <input
                                        type="search"
                                        name="search"
                                        maxLength={100}
                                        defaultValue={filters.search}
                                        placeholder="Try “birthday” or a product code"
                                        className="h-11 rounded-xl border border-popjoy-divider bg-white px-3 text-sm font-normal text-popjoy-ink transition outline-none focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-popjoy-muted">
                                    Category
                                    <select
                                        name="category"
                                        defaultValue={filters.category}
                                        className="h-11 rounded-xl border border-popjoy-divider bg-white px-3 text-sm font-normal text-popjoy-ink outline-none focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                                    >
                                        <option value="">All categories</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.slug}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-popjoy-muted">
                                    Occasion
                                    <select
                                        name="occation"
                                        defaultValue={filters.occation}
                                        className="h-11 rounded-xl border border-popjoy-divider bg-white px-3 text-sm font-normal text-popjoy-ink outline-none focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                                    >
                                        <option value="">All occasions</option>
                                        {occasions.map((occasion) => (
                                            <option
                                                key={occasion.id}
                                                value={occasion.slug}
                                            >
                                                {occasion.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-popjoy-muted">
                                    Sort by
                                    <select
                                        name="sort"
                                        defaultValue={filters.sort}
                                        className="h-11 rounded-xl border border-popjoy-divider bg-white px-3 text-sm font-normal text-popjoy-ink outline-none focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="name">Name A–Z</option>
                                        <option value="price_asc">
                                            Price: low to high
                                        </option>
                                        <option value="price_desc">
                                            Price: high to low
                                        </option>
                                    </select>
                                </label>
                                <button
                                    type="submit"
                                    className="h-11 rounded-xl bg-popjoy-purple px-5 text-sm font-bold text-white transition-colors hover:bg-popjoy-purple/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                >
                                    Apply filters
                                </button>
                                <Link
                                    href="/products"
                                    className="inline-flex h-11 items-center justify-center px-3 text-sm font-semibold text-popjoy-purple hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                >
                                    Clear
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>

                <section
                    id="catalog-grid"
                    aria-label="Balloon products"
                    className="px-5 py-8 sm:px-8 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="font-plus-jakarta text-xl font-semibold">
                                {selectedCategory?.name ??
                                    selectedOccasion?.name ??
                                    'All balloons'}
                            </h2>
                            <p
                                className="text-sm text-popjoy-muted"
                                aria-live="polite"
                            >
                                {products.total === 0
                                    ? 'No balloons found'
                                    : `Showing ${products.from}–${products.to} of ${products.total} balloons`}
                            </p>
                        </div>

                        {products.data.length === 0 ? (
                            <div className="rounded-3xl border border-popjoy-divider bg-white px-6 py-16 text-center">
                                <h3 className="font-plus-jakarta text-lg font-semibold">
                                    No balloons match those filters
                                </h3>
                                <p className="mt-2 text-sm text-popjoy-muted">
                                    Try a different search or clear one of the
                                    filters.
                                </p>
                                <Link
                                    href="/products"
                                    className="mt-5 inline-flex rounded-full bg-popjoy-purple px-5 py-2.5 text-sm font-bold text-white hover:bg-popjoy-purple/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                >
                                    Show all balloons
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <article
                                        key={product.id}
                                        className="group overflow-hidden rounded-3xl border border-popjoy-divider/70 bg-white transition-shadow hover:shadow-lg hover:shadow-popjoy-purple/10"
                                    >
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-popjoy-purple"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-popjoy-purple-bg/50">
                                                {product.primary_image ? (
                                                    <img
                                                        src={
                                                            product.primary_image
                                                        }
                                                        alt={product.name}
                                                        loading="lazy"
                                                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center">
                                                        <ShoppingBag
                                                            aria-hidden="true"
                                                            className="size-12 text-popjoy-purple/35"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 p-4">
                                                {product.category && (
                                                    <p className="text-xs font-semibold tracking-wide text-popjoy-purple uppercase">
                                                        {product.category.name}
                                                    </p>
                                                )}
                                                <h3 className="line-clamp-2 min-h-10 font-plus-jakarta text-sm leading-5 font-bold text-popjoy-ink">
                                                    {product.name}
                                                </h3>
                                                <p className="text-base font-bold text-popjoy-ink">
                                                    {formatCurrency(
                                                        product.selling_price,
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}

                        {products.last_page > 1 && (
                            <nav
                                aria-label="Product pages"
                                className="mt-8 flex items-center justify-between gap-4 text-sm"
                            >
                                {products.prev_page_url ? (
                                    <Link
                                        href={products.prev_page_url}
                                        preserveScroll
                                        className="rounded-full border border-popjoy-divider bg-white px-4 py-2 font-semibold text-popjoy-ink hover:border-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                    >
                                        Previous
                                    </Link>
                                ) : (
                                    <span />
                                )}
                                <span className="text-popjoy-muted">
                                    Page {products.current_page} of{' '}
                                    {products.last_page}
                                </span>
                                {products.next_page_url ? (
                                    <Link
                                        href={products.next_page_url}
                                        preserveScroll
                                        className="rounded-full border border-popjoy-divider bg-white px-4 py-2 font-semibold text-popjoy-ink hover:border-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                    >
                                        Next
                                    </Link>
                                ) : (
                                    <span />
                                )}
                            </nav>
                        )}
                    </div>
                </section>
            </main>
            <FigmaFooter />

            <CookieConsent />

            {/* Celebration basket drawer */}
            <CartSidebar
                cart={{
                    items: cart?.items ?? [],
                    count: cart?.count ?? 0,
                    total: cart?.total ?? '0',
                }}
                open={cartOpen}
                onClose={() => setCartOpen(false)}
            />
        </>
    );
}
