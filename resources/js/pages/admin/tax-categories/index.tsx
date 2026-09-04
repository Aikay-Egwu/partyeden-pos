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

type TaxCategory = {
    id: string;
    name: string;
    rate: string;
    is_default: boolean;
    is_active: boolean;
};
type Props = {
    taxCategories: {
        data: TaxCategory[];
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

export default function TaxCategoriesIndex({ taxCategories, filters }: Props) {
    const deleteDialog = useDeleteDialog<TaxCategory>();

    const meta: PaginationMeta = {
        current_page: taxCategories.current_page,
        last_page: taxCategories.last_page,
        per_page: taxCategories.per_page,
        total: taxCategories.total,
        from: taxCategories.from,
        to: taxCategories.to,
        links: taxCategories.links,
    };
    const links: PaginationLinks = {
        first: taxCategories.first_page_url ?? null,
        last: taxCategories.last_page_url ?? null,
        prev: taxCategories.prev_page_url,
        next: taxCategories.next_page_url,
    };

    const handleSearch = useCallback((v: string) => {
        router.get(
            '/admin/tax-categories',
            { search: v },
            { preserveState: true, preserveScroll: true },
        );
    }, []);

    const columns: Column<TaxCategory>[] = [
        { key: 'name', label: 'Name' },
        { key: 'rate', label: 'Rate (%)', render: (t) => `${t.rate}%` },
        {
            key: 'is_default',
            label: 'Default',
            render: (t) => (t.is_default ? 'Yes' : 'No'),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (t) => <ActiveBadge active={t.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Tax Categories" />
            <div className="space-y-6">
                <PageHeader
                    title="Tax Categories"
                    description="Configure tax rates"
                    createUrl="/admin/tax-categories/create"
                />
                <DataTable
                    columns={columns}
                    data={taxCategories.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search tax categories..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(t) => `/admin/tax-categories/${t.id}/edit`}
                    deleteAction={(t) => deleteDialog.openDialog(t)}
                    rowKey={(t) => t.id}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/tax-categories/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="tax category"
                />
            </div>
        </>
    );
}
