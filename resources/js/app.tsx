import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import StoreLayout from '@/layouts/store-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'admin/orders/print':
                return null;
            case name === 'store/home':
                // Homepage renders its own store header and footer so it can
                // use full-bleed edge-to-edge sections (hero, value strip, etc.)
                return null;
            case name === 'store/products/index':
                // Shop All page renders its own full-bleed Figma header/footer.
                return null;
            case name === 'store/products/show':
                // Product details page renders its own full-bleed Figma header/footer.
                return null;
            case name === 'auth/login':
                // Login page renders its own full-viewport branded layout
                // (two-column split with gradient brand panel + form panel).
                return null;
            case name === 'auth/register':
                // Register page renders its own full-viewport branded layout
                // (matching login page's two-column brand/form split).
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('customer/'):
                return null;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('store/'):
                return StoreLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
