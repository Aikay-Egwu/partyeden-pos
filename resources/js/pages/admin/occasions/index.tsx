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

type Occasion = {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    products_count: number;
};

type Props = {
    occasions: {
        data: Occasion[];
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

export default function OccasionsIndex({ occasions, filters }: Props) {
    const deleteDialog = useDeleteDialog<Occasion>();

    const meta: PaginationMeta = {
        current_page: occasions.current_page,
        last_page: occasions.last_page,
        per_page: occasions.per_page,
        total: occasions.total,
        from: occasions.from,
        to: occasions.to,
        links: occasions.links,
    };

    const links: PaginationLinks = {
        first: occasions.first_page_url ?? null,
        last: occasions.last_page_url ?? null,
        prev: occasions.prev_page_url,
        next: occasions.next_page_url,
    };

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/occasions',
            { search: value },
            { preserveState: true, preserveScroll: true },
        );
    }, []);

    const columns: Column<Occasion>[] = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'products_count', label: 'Products' },
        {
            key: 'is_active',
            label: 'Status',
            render: (occasion) => <ActiveBadge active={occasion.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Occasions" />
            <div className="space-y-6">
                <PageHeader
                    title="Occasions"
                    description="Manage occasion groupings for the storefront"
                    createUrl="/admin/occasions/create"
                />
                <DataTable
                    columns={columns}
                    data={occasions.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search occasions..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(occasion) =>
                        `/admin/occasions/${occasion.id}/edit`
                    }
                    deleteAction={(occasion) =>
                        deleteDialog.openDialog(occasion)
                    }
                    rowKey={(occasion) => occasion.id}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/occasions/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="occasion"
                />
            </div>
        </>
    );
}
