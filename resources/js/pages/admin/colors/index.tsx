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

// Color shape from the database
type Color = {
    id: number;
    name: string;
    hex_code: string | null;
    is_active: boolean;
};

type Props = {
    colors: {
        data: Color[];
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
 * Colors list page for managing balloon customization colors.
 * Admin can add, edit, and deactivate colors available to customers.
 */
export default function ColorsIndex({ colors, filters }: Props) {
    const deleteDialog = useDeleteDialog<Color>();

    const meta: PaginationMeta = {
        current_page: colors.current_page,
        last_page: colors.last_page,
        per_page: colors.per_page,
        total: colors.total,
        from: colors.from,
        to: colors.to,
        links: colors.links,
    };
    const links: PaginationLinks = {
        first: colors.first_page_url ?? null,
        last: colors.last_page_url ?? null,
        prev: colors.prev_page_url,
        next: colors.next_page_url,
    };

    // Handle search with page reload
    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/colors',
                { search: value, ...filters },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    // Table column definitions
    const columns: Column<Color>[] = [
        { key: 'name', label: 'Name' },
        {
            key: 'hex_code',
            label: 'Preview',
            render: (c) => (
                <div className="flex items-center gap-2">
                    {c.hex_code && (
                        <span
                            className="inline-block size-4 rounded-full border"
                            style={{ backgroundColor: c.hex_code }}
                        />
                    )}
                    <span className="text-xs text-muted-foreground">
                        {c.hex_code ?? '-'}
                    </span>
                </div>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (c) => <ActiveBadge active={c.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Colors" />
            <div className="space-y-6">
                <PageHeader
                    title="Colors"
                    description="Manage colors available for product customization"
                    createUrl="/admin/colors/create"
                />

                <DataTable
                    columns={columns}
                    data={colors.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by color name..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(c) => `/admin/colors/${c.id}/edit`}
                    deleteAction={(c) => deleteDialog.openDialog(c)}
                    rowKey={(c) => c.id.toString()}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/colors/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="color"
                />
            </div>
        </>
    );
}
