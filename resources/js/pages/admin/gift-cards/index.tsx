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
import { formatCurrency } from '@/lib/currency';

type GiftCard = {
    id: string;
    code: string;
    original_amount: string;
    current_balance: string;
    status: string;
    recipient_name: string | null;
    issued_at: string | null;
    expires_at: string | null;
    customer?: { id: string; first_name: string; last_name: string } | null;
};

type Props = {
    giftCards: {
        data: GiftCard[];
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

export default function GiftCardsIndex({ giftCards, filters }: Props) {
    const deleteDialog = useDeleteDialog<GiftCard>();

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/gift-cards',
                { ...filters, search: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    const handleStatusFilter = useCallback(
        (value: string) => {
            router.get(
                '/admin/gift-cards',
                { ...filters, status: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    const meta: PaginationMeta = {
        current_page: giftCards.current_page,
        last_page: giftCards.last_page,
        per_page: giftCards.per_page,
        total: giftCards.total,
        from: giftCards.from,
        to: giftCards.to,
        links: giftCards.links,
    };

    const links: PaginationLinks = {
        first: giftCards.first_page_url ?? null,
        last: giftCards.last_page_url ?? null,
        prev: giftCards.prev_page_url,
        next: giftCards.next_page_url,
    };

    const columns: Column<GiftCard>[] = [
        { key: 'code', label: 'Code' },
        {
            key: 'customer',
            label: 'Customer',
            render: (g) =>
                g.customer
                    ? `${g.customer.first_name} ${g.customer.last_name}`
                    : '-',
        },
        {
            key: 'recipient_name',
            label: 'Recipient',
            render: (g) => g.recipient_name ?? '-',
        },
        {
            key: 'original_amount',
            label: 'Original',
            render: (g) => formatCurrency(g.original_amount),
        },
        {
            key: 'current_balance',
            label: 'Balance',
            render: (g) => formatCurrency(g.current_balance),
        },
        {
            key: 'status',
            label: 'Status',
            render: (g) => <StatusBadge value={g.status} />,
        },
        {
            key: 'expires_at',
            label: 'Expires',
            render: (g) => (g.expires_at ? g.expires_at.split('T')[0] : '-'),
        },
    ];

    return (
        <>
            <Head title="Gift Cards" />
            <div className="space-y-6">
                <PageHeader
                    title="Gift Cards"
                    description="Issue and manage gift cards"
                    createUrl="/admin/gift-cards/create"
                />

                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="depleted">Depleted</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={giftCards.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by code..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(g) => `/admin/gift-cards/${g.id}/edit`}
                    deleteAction={(g) => deleteDialog.openDialog(g)}
                    rowKey={(g) => g.id}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/gift-cards/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.code}
                    resource="gift card"
                />
            </div>
        </>
    );
}
