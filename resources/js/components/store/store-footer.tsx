import { Link } from '@inertiajs/react';
import { Instagram, Mail } from 'lucide-react';
import { NewsletterForm } from '@/components/store/newsletter-form';

const footerLinks = {
    shop: [
        { label: 'All Balloons', href: '/products' },
        { label: 'Occasions', href: '/occasions' },
        { label: 'Best Sellers', href: '/' },
        { label: 'Latest Arrivals', href: '/' },
    ],
    occasions: [
        { label: 'All Occasions', href: '/occasions' },
        { label: 'Customer Reviews', href: '/reviews' },
        { label: 'Customer Gallery', href: '/gallery' },
    ],
    support: [
        { label: 'Track Order', href: '/orders/track' },
        { label: 'Checkout', href: '/checkout' },
        { label: 'Cart', href: '/cart' },
    ],
    about: [
        { label: 'Reviews', href: '/reviews' },
        { label: 'Gallery', href: '/gallery' },
        { label: 'Blog', href: '/blog' },
        { label: 'Home', href: '/' },
    ],
};

/**
 * Multi-column store footer with links, socials, newsletter, and copyright.
 */
export function StoreFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand & Newsletter */}
                    <div className="lg:col-span-1">
                        <Link
                            href="/"
                            className="text-lg font-bold tracking-tight"
                        >
                            Party Eden
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Beautiful personalised balloons for every
                            celebration.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Instagram"
                            >
                                <Instagram className="size-4" />
                            </a>
                            <a
                                href="mailto:hello@partyeden.co.uk"
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Email"
                            >
                                <Mail className="size-4" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            Shop
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            Occasions
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.occasions.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            Support
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            About
                        </h4>
                        <ul className="space-y-2.5">
                            {footerLinks.about.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="mt-12 border-t border-border pt-8">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Stay in the loop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Get exclusive offers and new arrivals.
                            </p>
                        </div>
                        <NewsletterForm />
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                    <p>&copy; {currentYear} Party Eden. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/reviews" className="hover:text-foreground">
                            Reviews
                        </Link>
                        <Link href="/blog" className="hover:text-foreground">
                            Blog
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
