import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/currency';

type OrderItem = {
    id: string;
    product_name: string;
    quantity: string;
    unit_price: string;
    total: string;
};

type Shipment = {
    id: string;
    tracking_number: string | null;
    carrier: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
};

type Order = {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total: string;
    placed_at: string;
    items: OrderItem[];
    customer?: { first_name: string; last_name: string; email: string } | null;
    shipments: Shipment[];
};

type Props = {
    searchedOrder: Order | null;
    filters: Record<string, string>;
};

/**
 * Order tracking page.
 * Search by order number + email to view status.
 */
export default function OrderTracking({ searchedOrder, filters }: Props) {
    return (
        <>
            <Head title="Track Order" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Track Your Order
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your order number and email to check the status
                    </p>
                </div>

                {/* Search form */}
                <form
                    method="get"
                    action="/orders/track"
                    className="mx-auto max-w-md space-y-4 rounded-lg border p-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="order_number">Order Number</Label>
                        <Input
                            id="order_number"
                            name="order_number"
                            placeholder="ORD-2026..."
                            defaultValue={filters.order_number ?? ''}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            defaultValue={filters.email ?? ''}
                        />
                    </div>
                    <Button type="submit" className="w-full gap-2">
                        <Search className="size-4" />
                        Track Order
                    </Button>
                </form>

                {/* Results */}
                {searchedOrder && (
                    <div className="mx-auto max-w-2xl space-y-4">
                        <div className="rounded-lg border p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">
                                    {searchedOrder.order_number}
                                </h2>
                                <StatusBadge value={searchedOrder.status} />
                            </div>
                            <div className="mt-3 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Placed
                                    </span>
                                    <span>
                                        {new Date(
                                            searchedOrder.placed_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Payment
                                    </span>
                                    <StatusBadge
                                        value={searchedOrder.payment_status}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(searchedOrder.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="rounded-lg border p-4">
                            <h3 className="font-medium">Items</h3>
                            <ul className="mt-2 space-y-1 text-sm">
                                {searchedOrder.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {item.product_name} x{item.quantity}
                                        </span>
                                        <span>
                                            {formatCurrency(item.total)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Shipments */}
                        {searchedOrder.shipments.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium">Shipments</h3>
                                <div className="mt-2 space-y-2">
                                    {searchedOrder.shipments.map((s) => (
                                        <div
                                            key={s.id}
                                            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded bg-muted/30 p-3 text-sm"
                                        >
                                            <span className="font-medium">
                                                {s.carrier ?? 'Unknown'}
                                            </span>
                                            <span>
                                                {s.tracking_number ??
                                                    'No tracking'}
                                            </span>
                                            <StatusBadge value={s.status} />
                                            {s.delivered_at && (
                                                <span className="text-muted-foreground">
                                                    Delivered{' '}
                                                    {new Date(
                                                        s.delivered_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-sm text-primary hover:underline"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}

                {/* No results */}
                {searchedOrder === null &&
                    (filters.order_number || filters.email) && (
                        <div className="mx-auto max-w-md rounded-lg border p-6 text-center">
                            <p className="text-muted-foreground">
                                No order found with those details.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Please check your order number and email and try
                                again.
                            </p>
                        </div>
                    )}
            </div>
        </>
    );
}
