import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
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
    featured: boolean;
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
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
    const [togglingFeaturedIds, setTogglingFeaturedIds] = useState<Set<string>>(new Set());

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

    const handleToggleStatus = useCallback(
        (category: Category) => {
            if (togglingIds.has(category.id)) {
                return;
            }

            const newStatus = !category.is_active;
            setTogglingIds((prev) => new Set(prev).add(category.id));

            router.patch(
                `/admin/categories/${category.id}/toggle-status`,
                { is_active: newStatus },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            newStatus
                                ? 'Category activated'
                                : 'Category deactivated',
                        );
                    },
                    onError: () => {
                        toast.error('Failed to update status');
                    },
                    onFinish: () => {
                        setTogglingIds((prev) => {
                            const next = new Set(prev);
                            next.delete(category.id);

                            return next;
                        });
                    },
                },
            );
        },
        [togglingIds],
    );

    const handleToggleFeatured = useCallback(
        (category: Category) => {
            if (togglingFeaturedIds.has(category.id)) {
                return;
            }

            const newFeatured = !category.featured;
            setTogglingFeaturedIds((prev) => new Set(prev).add(category.id));

            router.patch(
                `/admin/categories/${category.id}/toggle-featured`,
                { featured: newFeatured },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            newFeatured
                                ? 'Category marked as featured'
                                : 'Category removed from featured',
                        );
                    },
                    onError: () => {
                        toast.error('Failed to update featured status');
                    },
                    onFinish: () => {
                        setTogglingFeaturedIds((prev) => {
                            const next = new Set(prev);
                            next.delete(category.id);
                            return next;
                        });
                    },
                },
            );
        },
        [togglingFeaturedIds],
    );

    const columns: Column<Category>[] = [
        { key: 'name', label: 'Name' },
        {
            key: 'parent',
            label: 'Parent',
            render: (c) => c.parent?.name ?? 'Root',
        },
        { key: 'products_count', label: 'Products' },
        { key: 'children_count', label: 'Subcategories' },
        {
            key: 'featured',
            label: 'Featured',
            render: (c) => (
                <button
                    type="button"
                    onClick={() => handleToggleFeatured(c)}
                    disabled={togglingFeaturedIds.has(c.id)}
                    className={`cursor-pointer rounded transition-opacity hover:opacity-80 ${togglingFeaturedIds.has(c.id) ? 'animate-pulse opacity-50' : ''}`}
                    aria-label={`Toggle featured for ${c.name}`}
                >
                    <ActiveBadge active={c.featured} />
                </button>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (c) => (
                <button
                    type="button"
                    onClick={() => handleToggleStatus(c)}
                    disabled={togglingIds.has(c.id)}
                    className={`cursor-pointer rounded transition-opacity hover:opacity-80 ${togglingIds.has(c.id) ? 'animate-pulse opacity-50' : ''}`}
                    aria-label={`Toggle status for ${c.name}`}
                >
                    <ActiveBadge active={c.is_active} />
                </button>
            ),
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
