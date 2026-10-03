import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { CookieConsent } from '@/components/store/cookie-consent';
//import { FigmaAnnouncementBar } from '@/components/store/FigmaAnnouncementBar';
import { FigmaFooter } from '@/components/store/FigmaFooter';
import { FigmaHeader } from '@/components/store/FigmaHeader';

/**
 * Public storefront layout with announcement bar, full nav, and footer.
 *
 * Uses the FigmaHeader/FigmaAnnouncementBar/FigmaFooter components — the
 * same three blocks that the home page and shop-all (/products + product
 * detail) pages render directly — so every store page shows a consistent
 * header: balloon logo left, 6 nav links, inline search pill, cart icon
 * with gold badge, and matching announcement + footer.
 */
export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pageProps = usePage().props as unknown as {
        cart?: {
            count: number;
            total: string;
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
                add_ons?: Array<{
                    id: string;
                    name: string;
                    price?: string;
                }>;
            }>;
        };
    };
    const cart = pageProps.cart;
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-popjoy-bg">
            {/* <FigmaAnnouncementBar /> */}
            <FigmaHeader
                cartCount={cart?.count ?? 0}
                onCartClick={() => setCartOpen(true)}
            />
            <main className="min-h-screen">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <FigmaFooter />

            <CookieConsent />

            <CartSidebar
                cart={{
                    items: cart?.items ?? [],
                    count: cart?.count ?? 0,
                    total: cart?.total ?? '0',
                }}
                open={cartOpen}
                onClose={() => setCartOpen(false)}
            />
        </div>
    );
}
