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

type Category = {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    children_count: number;
    products_count: number;
    parent?: { id: string; name: string } | null;
};

type Props = {
    categories: {
        data: Category[];
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

export default function CategoriesIndex({ categories, filters }: Props) {
    const deleteDialog = useDeleteDialog<Category>();

    const meta: PaginationMeta = {
        current_page: categories.current_page,
        last_page: categories.last_page,
        per_page: categories.per_page,
        total: categories.total,
        from: categories.from,
        to: categories.to,
        links: categories.links,
    };
    const links: PaginationLinks = {
        first: categories.first_page_url ?? null,
        last: categories.last_page_url ?? null,
        prev: categories.prev_page_url,
        next: categories.next_page_url,
    };

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/categories',
            { search: value },
            { preserveState: true, preserveScroll: true },
        );
    }, []);

    const columns: Column<Category>[] = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        {
            key: 'parent',
            label: 'Parent',
            render: (c) => c.parent?.name ?? 'Root',
        },
        { key: 'products_count', label: 'Products' },
        { key: 'children_count', label: 'Subcategories' },
        {
            key: 'is_active',
            label: 'Status',
            render: (c) => <ActiveBadge active={c.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Categories" />
            <div className="space-y-6">
                <PageHeader
                    title="Categories"
                    description="Organize products into hierarchical groups"
                    createUrl="/admin/categories/create"
                />
                <DataTable
                    columns={columns}
                    data={categories.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search categories..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(c) => `/admin/categories/${c.id}/edit`}
                    deleteAction={(c) => deleteDialog.openDialog(c)}
                    rowKey={(c) => c.id}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/categories/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="category"
                />
            </div>
        </>
    );
}
