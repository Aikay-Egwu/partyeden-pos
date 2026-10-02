import { Link, usePage } from '@inertiajs/react';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { CatalogSearch } from '@/components/store/catalog-search';

import { cn } from '@/lib/utils';

/**
 * Navigation link item for the FigmaHeader desktop nav.
 */
export type FigmaNavLink = {
    /** Primary line of nav label */
    labelPrimary: string;
    /** Secondary line of nav label (for wrapped two-line labels) */
    labelSecondary?: string;
    /** Href destination when clicked */
    href: string;
};

/**
 * Props for the FigmaHeader component.
 * Matches the Figma `.container6` spec: logo, 6 nav links, search, party date checker, cart with gold badge.
 */
export type FigmaHeaderProps = {
    /** Optional array of nav links. Falls back to the 6 default Party Eden categories. */
    navLinks?: FigmaNavLink[];
    /** Cart item count shown in the gold badge */
    cartCount?: number;
    /** Optional click handler for the cart icon (opens basket drawer) */
    onCartClick?: () => void;
    /** Optional additional className for the outer header */
    className?: string;
    /** Optional id attribute for the outer header */
    id?: string;
};

const defaultNavLinks: FigmaNavLink[] = [
    { labelPrimary: 'Shop', href: '/products' },
    { labelPrimary: 'Categories', href: '/categories' },
    { labelPrimary: 'Occasions', href: '/occasions' },
    /* { labelPrimary: 'Reviews', href: '/reviews' },
    { labelPrimary: 'Gallery', href: '/gallery' },
    { labelPrimary: 'Blog', href: '/blog' }, */
];

/**
 * Store header matching the Figma `.container6` spec.
 * Includes the Party Eden balloon boutique logo, 6 category nav links,
 * search pill input, Party Date Checker CTA, and shopping cart with gold count badge.
 *
 * @example
 * <FigmaHeader />
 */
export function FigmaHeader({
    navLinks = defaultNavLinks,
    cartCount,
    onCartClick,
    className,
    id,
}: FigmaHeaderProps) {
    const { cart } = usePage().props as {
        cart?: { count: number };
    };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const itemCount = cartCount ?? cart?.count ?? 0;

    return (
        <header
            role="banner"
            id={id}
            className={cn(
                'relative z-40 w-full border-b border-popjoy-divider/40 bg-popjoy-bg/95 backdrop-blur-md',
                className,
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 px-4 py-3 sm:px-6 lg:h-20 lg:flex-nowrap lg:px-8 lg:py-0">
                <Link
                    href="/"
                    className="inline-flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-popjoy-purple"
                >
                    <div className="flex items-center rounded-2xl">
                        <div className="flex items-center rounded-2xl px-1 py-2 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
                            <img
                                src="/logo.png"
                                alt=""
                                aria-hidden="true"
                                className="h-6 w-6 overflow-hidden"
                            />
                        </div>
                    </div>
                    <span className="inline-flex flex-col items-start">
                        <span className="font-plus-jakarta text-xl leading-7 font-bold tracking-tight text-popjoy-ink">
                            Party Eden
                        </span>
                        {/* <span className="-mt-1 w-16 text-[11px] leading-4.25 font-bold tracking-[1.1px] text-popjoy-purple uppercase">
                            BALLOON
                            <br />
                            BOUTIQUE
                        </span> */}
                    </span>
                </Link>

                <nav
                    aria-label="Main store navigation"
                    className="hidden items-center gap-4 xl:flex"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={`${link.labelPrimary}-${link.href}`}
                            href={link.href}
                            className="inline-flex shrink-0 flex-col items-start rounded-sm py-1 transition-colors hover:text-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-popjoy-purple"
                        >
                            <span className="font-sans text-sm leading-5 font-semibold text-popjoy-ink">
                                {link.labelPrimary}
                                {link.labelSecondary && (
                                    <>
                                        <br />
                                        {link.labelSecondary}
                                    </>
                                )}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto inline-flex shrink-0 items-center gap-3">
                    <div className="hidden w-72 xl:block">
                        <CatalogSearch placeholder="Search themes, ages..." />
                    </div>
                    {/* Cart icon with live gold item count badge */}
                    {onCartClick ? (
                        <button
                            type="button"
                            onClick={onCartClick}
                            aria-label={`Shopping cart, ${itemCount} items`}
                            className="relative inline-flex items-center justify-center rounded-full bg-popjoy-purple-bg p-2.5 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                        >
                            <ShoppingCart
                                aria-hidden="true"
                                className="h-4.25 w-4.25 shrink-0"
                            />
                            {itemCount > 0 && (
                                <span
                                    className="absolute -top-1.25 -right-1 flex h-5.25 min-w-5 items-center justify-center rounded-full border-2 border-popjoy-bg bg-popjoy-gold px-1"
                                    aria-hidden="true"
                                >
                                    <span className="font-sans text-[11px] leading-4.25 font-bold text-popjoy-gold-ink">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                </span>
                            )}
                        </button>
                    ) : (
                        <Link
                            href="/cart"
                            aria-label={`Shopping cart, ${itemCount} items`}
                            className="relative inline-flex items-center justify-center rounded-full bg-popjoy-purple-bg p-2.5 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                        >
                            <ShoppingCart
                                aria-hidden="true"
                                className="h-4.25 w-4.25 shrink-0"
                            />
                            {itemCount > 0 && (
                                <span
                                    className="absolute -top-1.25 -right-1 flex h-5.25 min-w-5 items-center justify-center rounded-full border-2 border-popjoy-bg bg-popjoy-gold px-1"
                                    aria-hidden="true"
                                >
                                    <span className="font-sans text-[11px] leading-4.25 font-bold text-popjoy-gold-ink">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                </span>
                            )}
                        </Link>
                    )}
                    <button
                        type="button"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="store-mobile-navigation"
                        onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
                        className="inline-flex items-center justify-center rounded-full bg-popjoy-purple-bg p-2.5 text-popjoy-ink transition-colors hover:bg-popjoy-purple-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple xl:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X aria-hidden="true" className="size-5" />
                        ) : (
                            <Menu aria-hidden="true" className="size-5" />
                        )}
                    </button>
                </div>

                <div className="order-3 w-full pt-3 sm:pt-0 xl:hidden">
                    <CatalogSearch placeholder="Search themes, ages..." />
                </div>
                {mobileMenuOpen && (
                    <nav
                        id="store-mobile-navigation"
                        aria-label="Mobile store navigation"
                        className="order-4 grid w-full grid-cols-2 gap-1 border-t border-popjoy-divider/40 pt-3 xl:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={`${link.labelPrimary}-${link.href}`}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-popjoy-ink transition-colors hover:bg-popjoy-purple-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                            >
                                {link.labelPrimary}
                                {link.labelSecondary
                                    ? ` ${link.labelSecondary}`
                                    : ''}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
}
