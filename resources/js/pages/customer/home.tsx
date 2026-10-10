import { Head, Link, usePage } from '@inertiajs/react';
import {
    Gift,
    Grid3X3,
    MapPin,
    MoreHorizontal,
    Package,
    ShoppingBag,
    Sparkles,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { CookieConsent } from '@/components/store/cookie-consent';
import { FigmaFooter } from '@/components/store/FigmaFooter';
import { FigmaHeader } from '@/components/store/FigmaHeader';
import TextLink from '@/components/text-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import store from '@/routes/store';

type CustomerShape = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
};

type OrderRow = {
    id: string | number;
    total: string;
    status: string;
    created_at: string | null;
};

type QuickLink = {
    label: string;
    href: string;
    icon: string;
};

type Props = {
    customer: CustomerShape;
    orders: OrderRow[];
    loyaltyPoints: number;
    quickLinks: QuickLink[];
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Package,
    User: UserIcon,
    MapPin,
    Gift,
};

function getQuickLinkIcon(iconName: string) {
    return iconMap[iconName] ?? MoreHorizontal;
}

function getOrderBadgeVariant(
    status: string,
): 'default' | 'secondary' | 'destructive' {
    const s = status.toLowerCase();

    if (s === 'paid' || s === 'complete' || s === 'completed') {
        return 'default';
    }

    if (s === 'pending') {
        return 'secondary';
    }

    if (s === 'cancelled' || s === 'canceled' || s === 'failed') {
        return 'destructive';
    }

    return 'default';
}

export default function Home({
    customer,
    orders,
    loyaltyPoints,
    quickLinks,
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
            }>;
            count: number;
            total: string;
        };
    };
    const cart = pageProps.cart;
    const [cartOpen, setCartOpen] = useState(false);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) {
            return '—';
        }

        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return '—';
        }
    };

    const formatTotal = (total: string) => {
        if (total.startsWith('£')) {
            return total;
        }

        return `£${total}`;
    };

    const truncateOrderId = (id: string | number) => {
        const s = String(id);

        if (s.length <= 12) {
            return s;
        }

        return `#${s.slice(-8)}`;
    };

    return (
        <>
            <Head title={`${customer.first_name}'s account — Party &amp; Eden`} />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:bg-popjoy-purple focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to content
            </a>

            <div className="min-h-screen w-full bg-popjoy-bg text-popjoy-ink">
                <FigmaHeader onCartClick={() => setCartOpen(true)} />

                <main
                    id="main"
                    role="main"
                    className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
                >
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1
                                className="font-bold tracking-tight"
                                style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                }}
                            >
                                Hi, {customer.first_name} 👋
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Welcome back to your Party &amp; Eden account.
                            </p>
                        </div>

                        <Link href={home()}>
                            <div className="flex h-12 items-center rounded-xl bg-popjoy-purple px-5 font-semibold text-white transition hover:bg-popjoy-purple/90 sm:h-[52px]">
                                Back to shopping
                            </div>
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-popjoy-divider bg-white/70 p-6 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div
                                    aria-hidden="true"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-popjoy-purple/10 text-popjoy-purple"
                                >
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    Your details
                                </h2>
                            </div>
                            <div className="mt-4 grid gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        Name:{' '}
                                    </span>
                                    {customer.first_name} {customer.last_name}
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        Email:{' '}
                                    </span>
                                    <a
                                        href={`mailto:${customer.email}`}
                                        className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
                                    >
                                        {customer.email}
                                    </a>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        Phone:{' '}
                                    </span>
                                    {customer.phone ? (
                                        <span>{customer.phone}</span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Not provided
                                        </span>
                                    )}
                                </div>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 self-start px-2"
                                >
                                    <a href="#">Edit profile</a>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-popjoy-divider bg-white/70 p-6 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div
                                    aria-hidden="true"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-popjoy-gold/20 text-popjoy-ink"
                                >
                                    <Gift className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    Loyalty rewards
                                </h2>
                            </div>
                            <div className="mt-4">
                                <div className="text-4xl font-extrabold text-popjoy-purple tabular-nums">
                                    {loyaltyPoints}
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Points earned
                                </div>
                            </div>
                            <div className="mt-5">
                                {loyaltyPoints === 0 ? (
                                    <Button asChild variant="outline" size="sm">
                                        <a href="#">Join loyalty program</a>
                                    </Button>
                                ) : (
                                    <TextLink href="#" className="text-sm">
                                        View loyalty history
                                    </TextLink>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-popjoy-divider bg-white/70 p-6 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div
                                    aria-hidden="true"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-popjoy-divider bg-popjoy-purple-bg"
                                >
                                    <Grid3X3 className="h-5 w-5 text-popjoy-ink" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    Quick links
                                </h2>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {quickLinks.map((link, idx) => {
                                    const Icon = getQuickLinkIcon(link.icon);

                                    return (
                                        <Link
                                            key={`${link.label}-${idx}`}
                                            href={link.href}
                                            className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-popjoy-divider transition hover:border-popjoy-purple hover:bg-popjoy-purple/5"
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className="h-4 w-4 text-popjoy-purple"
                                            />
                                            <span className="text-sm font-medium">
                                                {link.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">
                                Recent orders
                            </h2>
                            <TextLink href="#" className="text-sm">
                                View all
                            </TextLink>
                        </div>

                        {orders.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-popjoy-divider bg-white/70 shadow-sm backdrop-blur">
                                <div className="hidden md:block">
                                    <table className="w-full text-sm">
                                        <thead className="bg-popjoy-purple-bg text-left font-medium text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-3">
                                                    Order
                                                </th>
                                                <th className="px-6 py-3">
                                                    Placed
                                                </th>
                                                <th className="px-6 py-3">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-popjoy-divider">
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4">
                                                        <a
                                                            href="#"
                                                            className="font-semibold text-popjoy-ink"
                                                        >
                                                            {truncateOrderId(
                                                                order.id,
                                                            )}
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant={getOrderBadgeVariant(
                                                                order.status,
                                                            )}
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 tabular-nums">
                                                        {formatTotal(
                                                            order.total,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-popjoy-divider md:hidden">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="space-y-3 p-5 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Order
                                                </span>
                                                <a
                                                    href="#"
                                                    className="font-semibold text-popjoy-ink"
                                                >
                                                    {truncateOrderId(order.id)}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Placed
                                                </span>
                                                <span>
                                                    {formatDate(
                                                        order.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Status
                                                </span>
                                                <Badge
                                                    variant={getOrderBadgeVariant(
                                                        order.status,
                                                    )}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Total
                                                </span>
                                                <span className="font-semibold tabular-nums">
                                                    {formatTotal(order.total)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-popjoy-divider bg-white/70 p-10 text-center shadow-sm backdrop-blur">
                                <div
                                    aria-hidden="true"
                                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-popjoy-purple/10"
                                >
                                    <ShoppingBag className="h-8 w-8 text-popjoy-purple" />
                                </div>
                                <h3 className="text-base font-semibold">
                                    No orders yet
                                </h3>
                                <p className="mt-1 text-muted-foreground">
                                    When you place an order, it&apos;ll show up
                                    here.
                                </p>
                                <Link href={store.products()}>
                                    <div className="mt-5 inline-flex h-12 items-center rounded-xl bg-popjoy-purple px-5 font-semibold text-white">
                                        <Sparkles
                                            aria-hidden="true"
                                            className="mr-2 h-4 w-4"
                                        />
                                        Start shopping
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </main>

                <FigmaFooter />
            </div>

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
        </>
    );
}
