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

type Location = {
    id: string;
    name: string;
    code: string;
    type: string;
    city: string;
    is_active: boolean;
};
type Props = {
    locations: {
        data: Location[];
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

export default function LocationsIndex({ locations, filters }: Props) {
    const deleteDialog = useDeleteDialog<Location>();
    const handleSearch = useCallback((v: string) => {
        router.get(
            '/admin/locations',
            { search: v },
            { preserveState: true, preserveScroll: true },
        );
    }, []);

    const meta: PaginationMeta = {
        current_page: locations.current_page,
        last_page: locations.last_page,
        per_page: locations.per_page,
        total: locations.total,
        from: locations.from,
        to: locations.to,
        links: locations.links,
    };

    const links: PaginationLinks = {
        first: locations.first_page_url ?? null,
        last: locations.last_page_url ?? null,
        prev: locations.prev_page_url,
        next: locations.next_page_url,
    };

    const columns: Column<Location>[] = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'type',
            label: 'Type',
            render: (l) => <span className="capitalize">{l.type}</span>,
        },
        { key: 'city', label: 'City', render: (l) => l.city ?? '-' },
        {
            key: 'is_active',
            label: 'Status',
            render: (l) => <ActiveBadge active={l.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Locations" />
            <div className="space-y-6">
                <PageHeader
                    title="Locations"
                    description="Stores, warehouses, and pop-up locations"
                    createUrl="/admin/locations/create"
                />
                <DataTable
                    columns={columns}
                    data={locations.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search locations..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(l) => `/admin/locations/${l.id}/edit`}
                    deleteAction={(l) => deleteDialog.openDialog(l)}
                    rowKey={(l) => l.id}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/locations/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="location"
                />
            </div>
        </>
    );
}
