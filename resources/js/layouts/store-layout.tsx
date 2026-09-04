import { AnnouncementBar } from '@/components/store/announcement-bar';
import { StoreFooter } from '@/components/store/store-footer';
import { StoreNav } from '@/components/store/store-nav';

/**
 * Public storefront layout with announcement bar, full nav, and footer.
 * Uses the AppShell/content wrapper for consistent page structure.
 */
export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AnnouncementBar />
            <StoreNav />
            <main className="min-h-screen">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <StoreFooter />
        </>
    );
}
