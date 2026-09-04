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

// Shape of a customer record
type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    is_active: boolean;
};

type Props = {
    customers: {
        data: Customer[];
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
 * Customers list page with search and CRUD actions.
 */
export default function CustomersIndex({ customers, filters }: Props) {
    const deleteDialog = useDeleteDialog<Customer>();

    const meta: PaginationMeta = {
        current_page: customers.current_page,
        last_page: customers.last_page,
        per_page: customers.per_page,
        total: customers.total,
        from: customers.from,
        to: customers.to,
        links: customers.links,
    };
    const links: PaginationLinks = {
        first: customers.first_page_url ?? null,
        last: customers.last_page_url ?? null,
        prev: customers.prev_page_url,
        next: customers.next_page_url,
    };

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/customers',
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const columns: Column<Customer>[] = [
        {
            key: 'name',
            label: 'Name',
            render: (c) => `${c.first_name} ${c.last_name}`,
        },
        { key: 'email', label: 'Email', render: (c) => c.email ?? '-' },
        { key: 'phone', label: 'Phone', render: (c) => c.phone ?? '-' },
        {
            key: 'company_name',
            label: 'Company',
            render: (c) => c.company_name ?? '-',
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (c) => <ActiveBadge active={c.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Customers" />
            <div className="space-y-6">
                <PageHeader
                    title="Customers"
                    description="Manage your customer base"
                    createUrl="/admin/customers/create"
                />

                <DataTable
                    columns={columns}
                    data={customers.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by name, email, or phone..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(c) => `/admin/customers/${c.id}/edit`}
                    deleteAction={(c) => deleteDialog.openDialog(c)}
                    rowKey={(c) => c.id}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/customers/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={
                        deleteDialog.item
                            ? `${deleteDialog.item.first_name} ${deleteDialog.item.last_name}`
                            : undefined
                    }
                    resource="customer"
                />
            </div>
        </>
    );
}
