import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import {
    DeleteDialog,
    useDeleteDialog,
} from '@/components/admin/delete-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';

type PurchaseOrder = {
    id: string;
    po_number: string;
    status: string;
    order_date: string;
    expected_delivery_date: string | null;
    total_amount: string;
    currency: string;
    supplier?: { id: string; name: string } | null;
    location?: { id: string; name: string } | null;
    items_count: number;
};

type Props = {
    purchaseOrders: {
        data: PurchaseOrder[];
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
    suppliers: { id: string; name: string }[];
    filters: Record<string, string>;
};

export default function PurchaseOrdersIndex({
    purchaseOrders,
    suppliers,
    filters,
}: Props) {
    const deleteDialog = useDeleteDialog<PurchaseOrder>();

    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                '/admin/purchase-orders',
                { ...filters, [key]: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    const meta: PaginationMeta = {
        current_page: purchaseOrders.current_page,
        last_page: purchaseOrders.last_page,
        per_page: purchaseOrders.per_page,
        total: purchaseOrders.total,
        from: purchaseOrders.from,
        to: purchaseOrders.to,
        links: purchaseOrders.links,
    };

    const links: PaginationLinks = {
        first: purchaseOrders.first_page_url ?? null,
        last: purchaseOrders.last_page_url ?? null,
        prev: purchaseOrders.prev_page_url,
        next: purchaseOrders.next_page_url,
    };

    const columns: Column<PurchaseOrder>[] = [
        { key: 'po_number', label: 'PO Number' },
        {
            key: 'supplier',
            label: 'Supplier',
            render: (po) => po.supplier?.name ?? '-',
        },
        {
            key: 'location',
            label: 'Location',
            render: (po) => po.location?.name ?? '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (po) => <StatusBadge value={po.status} />,
        },
        { key: 'order_date', label: 'Order Date' },
        {
            key: 'total_amount',
            label: 'Total',
            render: (po) => `${po.currency} ${po.total_amount}`,
        },
        { key: 'items_count', label: 'Items' },
    ];

    return (
        <>
            <Head title="Purchase Orders" />
            <div className="space-y-6">
                <PageHeader
                    title="Purchase Orders"
                    description="Manage purchase orders from suppliers"
                    createUrl="/admin/purchase-orders/create"
                />

                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="partial">Partial</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.supplier_id ?? ''}
                        onChange={(e) =>
                            handleFilter('supplier_id', e.target.value)
                        }
                    >
                        <option value="">All Suppliers</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={purchaseOrders.data}
                    meta={meta}
                    links={links}
                    editUrl={(po) => `/admin/purchase-orders/${po.id}/edit`}
                    deleteAction={(po) => deleteDialog.openDialog(po)}
                    rowKey={(po) => po.id}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/purchase-orders/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.po_number}
                    resource="purchase order"
                />
            </div>
        </>
    );
}
