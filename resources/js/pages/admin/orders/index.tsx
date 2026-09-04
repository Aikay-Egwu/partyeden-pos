import { Head, router } from '@inertiajs/react';
import { Download, CheckCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';

// Shape of an order record
type Order = {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string | null;
    subtotal: string;
    tax_amount: string;
    discount_amount: string;
    total: string;
    created_at: string;
    customer?: { id: string; first_name: string; last_name: string } | null;
    location?: { id: string; name: string } | null;
    items_count: number;
};

type Props = {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: { url: string | null; label: string; active: boolean }[];
        next_page_url: string | null;
        prev_page_url: string | null;
        first_page_url: string | null;
        last_page_url: string | null;
    };
    filters: Record<string, string>;
};

/**
 * Orders list page with status filter and search.
 */
export default function OrdersIndex({ orders, filters }: Props) {
    const meta: PaginationMeta = {
        current_page: orders.current_page,
        last_page: orders.last_page,
        per_page: orders.per_page,
        total: orders.total,
        from: orders.from,
        to: orders.to,
        links: orders.links,
    };
    const links: PaginationLinks = {
        first: orders.first_page_url ?? null,
        last: orders.last_page_url ?? null,
        prev: orders.prev_page_url,
        next: orders.next_page_url,
    };

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleBulkConfirm = () => {
        if (selectedIds.length === 0) {
            return;
        }

        router.post(
            '/admin/orders/bulk-confirm',
            { order_ids: selectedIds },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('Selected orders have been confirmed.');
                },
            },
        );
    };

    const handleExport = () => {
        const query = new URLSearchParams(filters as any).toString();
        window.location.href = `/admin/orders/export?${query}`;
    };

    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                '/admin/orders',
                { ...filters, [key]: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    const columns: Column<Order>[] = [
        { key: 'order_number', label: 'Order #' },
        {
            key: 'customer',
            label: 'Customer',
            render: (o) =>
                o.customer
                    ? `${o.customer.first_name} ${o.customer.last_name}`
                    : 'Guest',
        },
        {
            key: 'status',
            label: 'Status',
            render: (o) => <StatusBadge value={o.status} />,
        },
        {
            key: 'payment_status',
            label: 'Payment',
            render: (o) => (
                <div className="flex flex-col gap-1">
                    <StatusBadge value={o.payment_status} />
                    {o.payment_method && (
                        <span className="text-xs text-muted-foreground">
                            via {o.payment_method}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'total',
            label: 'Total',
            render: (o) => formatCurrency(o.total),
        },
        { key: 'items_count', label: 'Items' },
        { key: 'created_at', label: 'Date' },
    ];

    return (
        <>
            <Head title="Orders" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Orders"
                        description="View and manage customer orders"
                    />
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <Button
                                onClick={handleBulkConfirm}
                                variant="default"
                            >
                                <CheckCircle className="mr-2 size-4" />
                                Confirm Selected ({selectedIds.length})
                            </Button>
                        )}
                        <Button onClick={handleExport} variant="outline">
                            <Download className="mr-2 size-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="preorder">Preorder</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.payment_status ?? ''}
                        onChange={(e) =>
                            handleFilter('payment_status', e.target.value)
                        }
                    >
                        <option value="">All Payment Statuses</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                    </select>

                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.fulfillment_type ?? ''}
                        onChange={(e) =>
                            handleFilter('fulfillment_type', e.target.value)
                        }
                    >
                        <option value="">All Fulfillment Types</option>
                        <option value="pickup">Pickup</option>
                        <option value="delivery">Delivery</option>
                        <option value="shipping">Shipping</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="h-9 w-auto"
                            value={filters.from_date ?? ''}
                            onChange={(e) =>
                                handleFilter('from_date', e.target.value)
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            to
                        </span>
                        <Input
                            type="date"
                            className="h-9 w-auto"
                            value={filters.to_date ?? ''}
                            onChange={(e) =>
                                handleFilter('to_date', e.target.value)
                            }
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={orders.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by order # or customer..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={(v) => handleFilter('search', v)}
                    editUrl={(o) => `/admin/orders/${o.id}`}
                    rowKey={(o) => o.id}
                    selectedRowKeys={selectedIds}
                    onSelectionChange={setSelectedIds}
                />
            </div>
        </>
    );
}
