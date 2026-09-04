import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ClipboardList,
    MapPin,
    Package,
    Receipt,
    ShoppingCart,
    Tags,
    Truck,
    Undo2,
    Users,
    Warehouse,
    TrendingUp,
    Clock,
    Award,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

// Dashboard card shape
type DashboardCard = {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
};

// Quick-access cards for admin sections
const dashboardCards: DashboardCard[] = [
    {
        title: 'Products',
        description: 'Manage your product catalog',
        href: '/admin/products',
        icon: Package,
        color: 'text-blue-600',
    },
    {
        title: 'Components',
        description: 'Manage reusable kit components',
        href: '/admin/components',
        icon: Package,
        color: 'text-sky-600',
    },
    {
        title: 'Categories',
        description: 'Organize products into categories',
        href: '/admin/categories',
        icon: Tags,
        color: 'text-purple-600',
    },
    {
        title: 'Transactions',
        description: 'View all POS transactions',
        href: '/admin/transactions',
        icon: ShoppingCart,
        color: 'text-green-600',
    },
    {
        title: 'Orders',
        description: 'Manage customer orders',
        href: '/admin/orders',
        icon: ShoppingCart,
        color: 'text-orange-600',
    },
    {
        title: 'Delivery Zones',
        description: 'Manage local delivery areas',
        href: '/admin/delivery-zones',
        icon: MapPin,
        color: 'text-rose-500',
    },
    {
        title: 'Loyalty',
        description: 'Manage loyalty balances and settings',
        href: '/admin/loyalty',
        icon: Award,
        color: 'text-violet-600',
    },
    {
        title: 'Customers',
        description: 'View and manage customers',
        href: '/admin/customers',
        icon: Users,
        color: 'text-teal-600',
    },
    {
        title: 'Inventory',
        description: 'Track stock levels',
        href: '/admin/inventory',
        icon: Warehouse,
        color: 'text-amber-600',
    },
    {
        title: 'Suppliers',
        description: 'Manage your suppliers',
        href: '/admin/suppliers',
        icon: Truck,
        color: 'text-indigo-600',
    },
    {
        title: 'Discounts',
        description: 'Manage promotional discounts',
        href: '/admin/discounts',
        icon: Tags,
        color: 'text-rose-600',
    },
    {
        title: 'Returns',
        description: 'Process product returns',
        href: '/admin/returns',
        icon: Undo2,
        color: 'text-red-600',
    },
    {
        title: 'Staff',
        description: 'Manage staff members',
        href: '/admin/staff',
        icon: Users,
        color: 'text-cyan-600',
    },
    {
        title: 'Audit Logs',
        description: 'View system audit trail',
        href: '/admin/audit-logs',
        icon: ClipboardList,
        color: 'text-gray-600',
    },
    {
        title: 'Gift Cards',
        description: 'Issue and manage gift cards',
        href: '/admin/gift-cards',
        icon: Receipt,
        color: 'text-pink-600',
    },
];

type Stats = {
    today_orders_count: number;
    today_revenue: number;
    orders_by_status: Record<string, number>;
    low_stock_count: number;
};

type RecentOrder = {
    id: string;
    order_number: string;
    status: string;
    total: string;
    created_at: string;
    customer?: { id: string; first_name: string; last_name: string } | null;
};

type Props = {
    stats: Stats;
    recentOrders: RecentOrder[];
};

export default function Dashboard({ stats, recentOrders }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="mx-auto max-w-7xl space-y-8 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your Party Eden EPOS system from one place.
                    </p>
                </div>

                {/* Top Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Today's Revenue
                            </p>
                            <h3 className="mt-1 text-2xl font-bold">
                                {formatCurrency(stats.today_revenue)}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <TrendingUp className="size-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Today's Orders
                            </p>
                            <h3 className="mt-1 text-2xl font-bold">
                                {stats.today_orders_count}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <ShoppingCart className="size-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pending Orders
                            </p>
                            <h3 className="mt-1 text-2xl font-bold">
                                {stats.orders_by_status.pending ?? 0}
                            </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <Clock className="size-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Low Stock Alerts
                            </p>
                            <h3 className="mt-1 text-2xl font-bold">
                                {stats.low_stock_count}
                            </h3>
                        </div>
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.low_stock_count > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                            <AlertTriangle className="size-5" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Recent Orders Table */}
                    <div className="rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="text-lg font-semibold">
                                Recent Orders
                            </h2>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/orders">View All</Link>
                            </Button>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Order #
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-6 text-center text-muted-foreground"
                                            >
                                                No recent orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="font-medium text-primary hover:underline"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {order.customer
                                                        ? `${order.customer.first_name} ${order.customer.last_name}`
                                                        : 'Guest'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        value={order.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Links Grid */}
                    <div className="space-y-6">
                        <div className="rounded-lg border p-4 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">
                                Order Status Breakdown
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {Object.entries(stats.orders_by_status).map(
                                    ([status, count]) => (
                                        <div
                                            key={status}
                                            className="rounded-md border p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <StatusBadge value={status} />
                                                <span className="text-lg font-semibold">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border p-4 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">
                                Quick Links
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {dashboardCards.map((card) => (
                                    <Link
                                        key={card.title}
                                        href={card.href}
                                        className="group flex items-start gap-3 rounded-md border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                    >
                                        <card.icon
                                            className={`mt-0.5 size-4 shrink-0 ${card.color}`}
                                        />
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-medium group-hover:text-primary">
                                                {card.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {card.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
