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

// Shape of a supplier record from the API
type Supplier = {
    id: string;
    name: string;
    code: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    country?: { id: string; name: string } | null;
    products_count: number;
};

type Props = {
    suppliers: {
        data: Supplier[];
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
 * Suppliers list page with search, pagination, and CRUD actions.
 */
export default function SuppliersIndex({ suppliers, filters }: Props) {
    const deleteDialog = useDeleteDialog<Supplier>();

    const meta: PaginationMeta = {
        current_page: suppliers.current_page,
        last_page: suppliers.last_page,
        per_page: suppliers.per_page,
        total: suppliers.total,
        from: suppliers.from,
        to: suppliers.to,
        links: suppliers.links,
    };
    const links: PaginationLinks = {
        first: suppliers.first_page_url ?? null,
        last: suppliers.last_page_url ?? null,
        prev: suppliers.prev_page_url,
        next: suppliers.next_page_url,
    };

    // Handle search with page reload
    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/suppliers',
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    // Table column definitions
    const columns: Column<Supplier>[] = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'contact_name',
            label: 'Contact',
            render: (s) => s.contact_name ?? '-',
        },
        { key: 'email', label: 'Email', render: (s) => s.email ?? '-' },
        {
            key: 'country',
            label: 'Country',
            render: (s) => s.country?.name ?? '-',
        },
        { key: 'products_count', label: 'Products' },
        {
            key: 'is_active',
            label: 'Status',
            render: (s) => <ActiveBadge active={s.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Suppliers" />
            <div className="space-y-6">
                <PageHeader
                    title="Suppliers"
                    description="Manage your suppliers"
                    createUrl="/admin/suppliers/create"
                />

                <DataTable
                    columns={columns}
                    data={suppliers.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by name or email..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(s) => `/admin/suppliers/${s.id}/edit`}
                    deleteAction={(s) => deleteDialog.openDialog(s)}
                    rowKey={(s) => s.id}
                />

                {/* Delete confirmation dialog */}
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/suppliers/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="supplier"
                />
            </div>
        </>
    );
}
