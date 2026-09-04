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

type Shipment = {
    id: string;
    tracking_number: string | null;
    carrier: string | null;
    shipping_method: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    order?: { id: string; order_number: string } | null;
};

type Props = {
    shipments: {
        data: Shipment[];
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

export default function ShipmentsIndex({ shipments, filters }: Props) {
    const deleteDialog = useDeleteDialog<Shipment>();

    const handleStatusFilter = useCallback((value: string) => {
        router.get(
            '/admin/shipments',
            { status: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const meta: PaginationMeta = {
        current_page: shipments.current_page,
        last_page: shipments.last_page,
        per_page: shipments.per_page,
        total: shipments.total,
        from: shipments.from,
        to: shipments.to,
        links: shipments.links,
    };

    const links: PaginationLinks = {
        first: shipments.first_page_url ?? null,
        last: shipments.last_page_url ?? null,
        prev: shipments.prev_page_url,
        next: shipments.next_page_url,
    };

    const columns: Column<Shipment>[] = [
        {
            key: 'order',
            label: 'Order',
            render: (s) => s.order?.order_number ?? '-',
        },
        {
            key: 'tracking_number',
            label: 'Tracking',
            render: (s) => s.tracking_number ?? '-',
        },
        { key: 'carrier', label: 'Carrier', render: (s) => s.carrier ?? '-' },
        {
            key: 'status',
            label: 'Status',
            render: (s) => <StatusBadge value={s.status} />,
        },
        {
            key: 'shipped_at',
            label: 'Shipped',
            render: (s) =>
                s.shipped_at
                    ? new Date(s.shipped_at).toLocaleDateString()
                    : '-',
        },
        {
            key: 'delivered_at',
            label: 'Delivered',
            render: (s) =>
                s.delivered_at
                    ? new Date(s.delivered_at).toLocaleDateString()
                    : '-',
        },
    ];

    return (
        <>
            <Head title="Shipments" />
            <div className="space-y-6">
                <PageHeader
                    title="Shipments"
                    description="Manage order shipments"
                    createUrl="/admin/shipments/create"
                />

                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={shipments.data}
                    meta={meta}
                    links={links}
                    editUrl={(s) => `/admin/shipments/${s.id}/edit`}
                    deleteAction={(s) => deleteDialog.openDialog(s)}
                    rowKey={(s) => s.id}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/shipments/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.tracking_number ?? undefined}
                    resource="shipment"
                />
            </div>
        </>
    );
}
