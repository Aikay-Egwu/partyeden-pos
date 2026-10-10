import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    ShoppingBag,
    ShoppingCart,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { CatalogSearch } from '@/components/store/catalog-search';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { dashboard } from '@/routes/customer';
import { getUserDisplayName } from '@/types';
import type { Auth } from '@/types';

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
    const { auth, cart } = usePage().props as {
        cart?: { count: number };
        auth?: Auth;
    };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const itemCount = cartCount ?? cart?.count ?? 0;
    // Guests have no authenticated user, so the account menu is hidden for them.
    const authUser = auth?.user ?? null;

    return (
        <header
            role="banner"
            id={id}
            className={cn(
                'relative z-40 w-full border-b border-popjoy-divider/40 bg-popjoy-bg/95 backdrop-blur-md',
                className,
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:gap-x-4 sm:px-6 lg:h-20 lg:flex-nowrap lg:gap-x-6 lg:px-8 lg:py-0">
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
                    className="hidden items-center gap-1 lg:flex xl:gap-4"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={`${link.labelPrimary}-${link.href}`}
                            href={link.href}
                            className="inline-flex shrink-0 items-center justify-center rounded-xl px-2.5 py-1.5 text-sm font-semibold text-popjoy-ink transition-colors hover:bg-popjoy-purple-bg hover:text-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-popjoy-purple sm:px-3"
                        >
                            <span>{link.labelPrimary}</span>
                            {link.labelSecondary ? (
                                <span className="ml-1">
                                    {link.labelSecondary}
                                </span>
                            ) : null}
                        </Link>
                    ))}
                </nav>

                <div className="inline-flex shrink-0 items-center gap-2 sm:gap-3">
                    <div className="hidden w-72 xl:block">
                        <CatalogSearch placeholder="Search themes, ages..." />
                    </div>
                    {/* Account menu — shown only when a user is signed in. */}
                    {authUser && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={`Account menu for ${getUserDisplayName(authUser)}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-popjoy-purple-bg px-3 py-2.5 text-sm font-semibold text-popjoy-ink transition-colors hover:bg-popjoy-purple-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                >
                                    <UserIcon
                                        aria-hidden="true"
                                        className="h-4 w-4 shrink-0"
                                    />
                                    <span className="hidden max-w-36 truncate sm:inline">
                                        {getUserDisplayName(authUser)}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56"
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <span className="block truncate text-sm font-medium text-popjoy-ink">
                                        {getUserDisplayName(authUser)}
                                    </span>
                                    <span className="block truncate text-xs text-popjoy-muted">
                                        {authUser.email}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={dashboard()}
                                        className="block w-full cursor-pointer"
                                    >
                                        <LayoutDashboard className="mr-2" />
                                        My dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/products"
                                        className="block w-full cursor-pointer"
                                    >
                                        <ShoppingBag className="mr-2" />
                                        Continue shopping
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        className="block w-full cursor-pointer"
                                    >
                                        <LogOut className="mr-2" />
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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
                                color="#000000"
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
                                color="#000000"
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
                        className="inline-flex items-center justify-center rounded-full bg-popjoy-purple-bg p-2.5 text-popjoy-ink transition-colors hover:bg-popjoy-purple-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple lg:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X aria-hidden="true" className="size-5" />
                        ) : (
                            <Menu aria-hidden="true" className="size-5" />
                        )}
                    </button>
                </div>

                {/* Search bar: full-width below logo on small screens; inline-flex slot at lg; swapped to the compact inline w-72 variant at xl */}
                <div className="order-3 mt-1 w-full sm:mt-2 lg:order-0 lg:mt-0 lg:max-w-sm lg:flex-1 lg:px-4 xl:hidden">
                    <CatalogSearch placeholder="Search themes, ages..." />
                </div>
                {mobileMenuOpen && (
                    <nav
                        id="store-mobile-navigation"
                        aria-label="Mobile store navigation"
                        className="order-4 w-full overflow-hidden rounded-2xl border border-popjoy-divider/50 bg-white shadow-inner sm:mt-2 lg:hidden"
                    >
                        {navLinks.map((link, idx) => (
                            <Link
                                key={`${link.labelPrimary}-${link.href}`}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    'flex items-center justify-between px-5 py-4 text-base font-semibold text-popjoy-ink transition-colors hover:bg-popjoy-purple-bg hover:text-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple',
                                    idx !== navLinks.length - 1 &&
                                        'border-b border-popjoy-divider/30',
                                )}
                            >
                                <span>
                                    {link.labelPrimary}
                                    {link.labelSecondary
                                        ? ` ${link.labelSecondary}`
                                        : ''}
                                </span>
                                <ChevronRight
                                    aria-hidden="true"
                                    className="h-5 w-5 text-popjoy-muted"
                                />
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
}
