import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { CookieConsent } from '@/components/store/cookie-consent';
//import { FigmaAnnouncementBar } from '@/components/store/FigmaAnnouncementBar';
//import { FigmaBespokeInstalls } from '@/components/store/FigmaBespokeInstalls';
import { FigmaBestsellersRow } from '@/components/store/FigmaBestsellersRow';
import type { StoreProductSummary } from '@/components/store/FigmaBestsellersRow';
import { FigmaCategoriesGrid } from '@/components/store/FigmaCategoriesGrid';
import { FigmaCelebrationServices } from '@/components/store/FigmaCelebrationServices';
//import { FigmaFeatureRow } from '@/components/store/FigmaFeatureRow';
import { FigmaFooter } from '@/components/store/FigmaFooter';
import { FigmaHeader } from '@/components/store/FigmaHeader';
import { FigmaHeroSection } from '@/components/store/FigmaHeroSection';
//import { FigmaLiveCustomiser } from '@/components/store/FigmaLiveCustomiser';
//import { FigmaNewsletter } from '@/components/store/FigmaNewsletter';
import { FigmaOccasionsRow } from '@/components/store/FigmaOccasionsRow';
import type { FigmaOccasionCard } from '@/components/store/FigmaOccasionsRow';
//import { FigmaPaletteSwatches } from '@/components/store/FigmaPaletteSwatches';
//import { FigmaReviewsFaq } from '@/components/store/FigmaReviewsFaq';

type StoreCategory = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
};

type Props = {
    categories: StoreCategory[];
    categoryCount: number;
    occasions?: FigmaOccasionCard[];
    bestSellers?: StoreProductSummary[];
    heroCarousel?: { src: string; alt: string }[];
};

/**
 * Party Eden storefront homepage — Figma-pixel-accurate composition.
 *
 * Rendered WITHOUT the default StoreLayout wrapper (see `app.tsx` layout
 * rules for `store/home` — returns `null`) so sections can render
 * full-bleed edge-to-edge on the page canvas.
 *
 * Page architecture:
 * - Skip link to main landmark (accessibility)
 * - Announcement bar → site header
 * - Hero section → feature row → categories grid
 * - Live customiser → bestsellers row → palette swatches
 * - Bespoke installs → reviews + FAQ → newsletter signup
 * - Site footer
 *
 * Every block is an independent, typed, reusable Figma* component
 * living under `components/store/`.
 */
export default function Home({
    categories,
    categoryCount,
    occasions,
    bestSellers,
    heroCarousel,
}: Props) {
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

    return (
        <>
            <Head title="Pop &amp; Joy — Make Every Moment Float" />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:bg-popjoy-purple focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to content
            </a>

            {/* Page canvas — Pop &amp; Joy cream/lilac background */}
            <div className="min-h-screen w-full bg-popjoy-bg">
                {/* Header stack */}
                {/* <FigmaAnnouncementBar /> */}
                <FigmaHeader onCartClick={() => setCartOpen(true)} />

                {/* Main content landmark */}
                <main id="main" role="main">
                    <FigmaHeroSection carouselImages={heroCarousel} />
                    {/* <FigmaFeatureRow /> */}

                    <FigmaCategoriesGrid
                        categories={categories}
                        totalCategories={categoryCount}
                    />
                    <FigmaOccasionsRow occasions={occasions ?? []} />
                    {/* <FigmaLiveCustomiser /> */}
                    <FigmaBestsellersRow products={bestSellers} />
                    <FigmaCelebrationServices />

                    {/* <FigmaPaletteSwatches /> */}
                    {/* <FigmaBespokeInstalls /> */}
                    {/* <FigmaReviewsFaq /> */}
                    {/* <FigmaNewsletter /> */}
                </main>

                {/* Footer */}
                <FigmaFooter />
            </div>

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
