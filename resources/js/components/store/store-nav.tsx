import { Link, usePage } from '@inertiajs/react';
import {
    Camera,
    FileText,
    Menu,
    Search,
    ShoppingCart,
    Star,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
    { label: 'Shop', href: '/products' },
    { label: 'Occasions', href: '/occasions' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
];

/**
 * Props for the StoreNav component.
 * Accepts an optional live cartCount override and onCartClick callback
 * to open the celebration basket drawer from the parent layout.
 */
type StoreNavProps = {
    /** Override cart count — falls back to Inertia page props */
    cartCount?: number;
    /** Optional click handler for the cart icon (opens basket drawer) */
    onCartClick?: () => void;
};

/**
 * Full store navigation with logo, links, search, wishlist, account, and cart.
 * Sticky on scroll with backdrop blur. Includes mobile hamburger menu.
 * Cart icon now opens the celebration basket drawer when onCartClick is provided,
 * with a live gold badge showing item count that updates on add/remove.
 */
export function StoreNav({ cartCount, onCartClick }: StoreNavProps) {
    const { cart } = usePage().props as {
        cart?: { count: number; total: string };
    };
    const itemCount = cartCount ?? cart?.count ?? 0;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-9 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                {/* Mobile hamburger */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="size-6" />
                    ) : (
                        <Menu className="size-6" />
                    )}
                </button>

                {/* Desktop left nav */}
                <nav className="hidden items-center gap-6 lg:flex">
                    {navLinks.slice(0, 3).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Center: Logo */}
                <Link
                    href="/"
                    className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-tight text-foreground"
                >
                    Party Eden
                </Link>

                {/* Desktop right nav + icons */}
                <div className="hidden items-center gap-6 lg:flex">
                    {navLinks.slice(3).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="ml-2 flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-full p-1.5 text-foreground/70 transition-colors hover:text-foreground"
                            aria-label="Search"
                        >
                            <Search className="size-5" />
                        </button>
                        <Link
                            href="/reviews"
                            className="rounded-full p-1.5 text-foreground/70 transition-colors hover:text-foreground"
                            aria-label="Reviews"
                        >
                            <Star className="size-5" />
                        </Link>
                        <Link
                            href="/gallery"
                            className="rounded-full p-1.5 text-foreground/70 transition-colors hover:text-foreground"
                            aria-label="Gallery"
                        >
                            <Camera className="size-5" />
                        </Link>
                        <Link
                            href="/blog"
                            className="rounded-full p-1.5 text-foreground/70 transition-colors hover:text-foreground"
                            aria-label="Blog"
                        >
                            <FileText className="size-5" />
                        </Link>

                        {/* Cart icon with live item count badge */}
                        {onCartClick ? (
                            <button
                                type="button"
                                onClick={onCartClick}
                                className="relative rounded-full p-1.5 text-foreground/70 transition-colors hover:text-foreground"
                                aria-label={`Shopping cart, ${itemCount} items`}
                            >
                                <ShoppingCart className="size-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-popjoy-gold text-[10px] font-bold text-popjoy-gold-ink ring-2 ring-white">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <Link
                                href="/cart"
                                className="relative rounded-full p-1.5 text-foreground/70 transition-colors hover:text-foreground"
                                aria-label={`Shopping cart, ${itemCount} items`}
                            >
                                <ShoppingCart className="size-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-popjoy-gold text-[10px] font-bold text-popjoy-gold-ink ring-2 ring-white">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile cart icon */}
                {onCartClick ? (
                    <button
                        type="button"
                        onClick={onCartClick}
                        className="relative lg:hidden"
                        aria-label={`Shopping cart, ${itemCount} items`}
                    >
                        <ShoppingCart className="size-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-popjoy-gold text-[10px] font-bold text-popjoy-gold-ink ring-2 ring-white">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </button>
                ) : (
                    <Link
                        href="/cart"
                        className="relative lg:hidden"
                        aria-label={`Shopping cart, ${itemCount} items`}
                    >
                        <ShoppingCart className="size-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-popjoy-gold text-[10px] font-bold text-popjoy-gold-ink ring-2 ring-white">
                                {itemCount > 99 ? '99+' : itemCount}
                            </span>
                        )}
                    </Link>
                )}
            </div>

            {/* Mobile menu dropdown */}
            {mobileOpen && (
                <nav className="border-t border-border bg-background px-4 pt-3 pb-6 lg:hidden">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="my-2 border-border" />
                        <div className="flex gap-3 px-3 pt-1">
                            <Link
                                href="/reviews"
                                className="rounded-full p-2 text-foreground/70 transition-colors hover:text-foreground"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Star className="size-5" />
                            </Link>
                            <Link
                                href="/blog"
                                className="rounded-full p-2 text-foreground/70 transition-colors hover:text-foreground"
                                onClick={() => setMobileOpen(false)}
                            >
                                <FileText className="size-5" />
                            </Link>
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
}
