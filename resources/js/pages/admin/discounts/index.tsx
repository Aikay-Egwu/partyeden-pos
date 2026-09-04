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
import { ActiveBadge } from '@/components/admin/status-badge';
import { formatCurrency } from '@/lib/currency';

// Shape of a discount record
type Discount = {
    id: string;
    name: string;
    code: string;
    type: string;
    value: string;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
};

type Props = {
    discounts: {
        data: Discount[];
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
 * Discounts list page with search and CRUD actions.
 */
export default function DiscountsIndex({ discounts, filters }: Props) {
    const deleteDialog = useDeleteDialog<Discount>();

    const meta: PaginationMeta = {
        current_page: discounts.current_page,
        last_page: discounts.last_page,
        per_page: discounts.per_page,
        total: discounts.total,
        from: discounts.from,
        to: discounts.to,
        links: discounts.links,
    };
    const links: PaginationLinks = {
        first: discounts.first_page_url ?? null,
        last: discounts.last_page_url ?? null,
        prev: discounts.prev_page_url,
        next: discounts.next_page_url,
    };

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/discounts',
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const columns: Column<Discount>[] = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'type',
            label: 'Type',
            render: (d) =>
                d.type === 'percentage'
                    ? `${d.value}%`
                    : formatCurrency(d.value),
        },
        {
            key: 'starts_at',
            label: 'Starts',
            render: (d) => d.starts_at ?? '-',
        },
        { key: 'ends_at', label: 'Ends', render: (d) => d.ends_at ?? '-' },
        {
            key: 'is_active',
            label: 'Status',
            render: (d) => <ActiveBadge active={d.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Discounts" />
            <div className="space-y-6">
                <PageHeader
                    title="Discounts"
                    description="Manage promotional discount codes"
                    createUrl="/admin/discounts/create"
                />

                <DataTable
                    columns={columns}
                    data={discounts.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by name or code..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(d) => `/admin/discounts/${d.id}/edit`}
                    deleteAction={(d) => deleteDialog.openDialog(d)}
                    rowKey={(d) => d.id}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/discounts/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="discount"
                />
            </div>
        </>
    );
}
