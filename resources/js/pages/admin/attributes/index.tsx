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

type Attribute = {
    id: string;
    name: string;
    code: string;
    type: string;
    is_active: boolean;
    values_count: number;
};
type Props = {
    attributes: {
        data: Attribute[];
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

export default function AttributesIndex({ attributes, filters }: Props) {
    const deleteDialog = useDeleteDialog<Attribute>();

    const meta: PaginationMeta = {
        current_page: attributes.current_page,
        last_page: attributes.last_page,
        per_page: attributes.per_page,
        total: attributes.total,
        from: attributes.from,
        to: attributes.to,
        links: attributes.links,
    };
    const links: PaginationLinks = {
        first: attributes.first_page_url ?? null,
        last: attributes.last_page_url ?? null,
        prev: attributes.prev_page_url,
        next: attributes.next_page_url,
    };

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/attributes',
            { search: value },
            { preserveState: true, preserveScroll: true },
        );
    }, []);

    const columns: Column<Attribute>[] = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'type',
            label: 'Type',
            render: (a) => <span className="capitalize">{a.type}</span>,
        },
        { key: 'values_count', label: 'Values' },
        {
            key: 'is_active',
            label: 'Status',
            render: (a) => <ActiveBadge active={a.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Attributes" />
            <div className="space-y-6">
                <PageHeader
                    title="Attributes"
                    description="Product attribute definitions (Size, Color, etc.)"
                    createUrl="/admin/attributes/create"
                />
                <DataTable
                    columns={columns}
                    data={attributes.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search attributes..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(a) => `/admin/attributes/${a.id}/edit`}
                    deleteAction={(a) => deleteDialog.openDialog(a)}
                    rowKey={(a) => a.id}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/attributes/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="attribute"
                />
            </div>
        </>
    );
}
