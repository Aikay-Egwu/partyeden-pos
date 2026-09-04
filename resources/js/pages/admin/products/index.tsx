import { Head, router } from '@inertiajs/react';
import { Copy, Loader2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';

// Shape of a product record from the API
type Product = {
    id: string;
    name: string;
    sku: string;
    selling_price: string;
    is_active: boolean;
    is_online_visible: boolean;
    best_seller_enabled: boolean;
    best_seller_rank?: number | null;
    category?: { id: string; name: string } | null;
};

type Props = {
    products: {
        data: Product[];
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
    categories: { id: string; name: string }[];
    filters: Record<string, string>;
};

/**
 * Products list page with search, pagination, and CRUD actions.
 */
export default function ProductsIndex({ products, filters }: Props) {
    const deleteDialog = useDeleteDialog<Product>();
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

    // Derive pagination meta and links from the Inertia paginator shape
    const meta: PaginationMeta = {
        current_page: products.current_page,
        last_page: products.last_page,
        per_page: products.per_page,
        total: products.total,
        from: products.from,
        to: products.to,
        links: products.links,
    };

    const links: PaginationLinks = {
        first: products.first_page_url ?? null,
        last: products.last_page_url ?? null,
        prev: products.prev_page_url,
        next: products.next_page_url,
    };

    // Handle search with page reload
    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/products',
                { search: value, ...filters },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    const handleDuplicate = useCallback(async (product: Product) => {
        setDuplicatingId(product.id);

        try {
            await router.post(`/admin/products/${product.id}/duplicate`);
        } catch {
            toast.error('Unable to duplicate the product right now.');
        } finally {
            setDuplicatingId(null);
        }
    }, []);

    // Table column definitions
    const columns: Column<Product>[] = [
        { key: 'name', label: 'Name' },
        { key: 'sku', label: 'SKU' },
        {
            key: 'selling_price',
            label: 'Price',
            render: (p) => formatCurrency(p.selling_price),
        },
        {
            key: 'category',
            label: 'Category',
            render: (p) => p.category?.name ?? '-',
        },
        {
            key: 'is_active',
            label: 'Online',
            render: (p) => (
                <Badge variant={p.is_online_visible ? 'default' : 'secondary'}>
                    {p.is_online_visible ? 'Visible' : 'Internal'}
                </Badge>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (p) => <ActiveBadge active={p.is_active} />,
        },
        {
            key: 'best_seller_enabled',
            label: 'Best Sellers',
            render: (p) =>
                p.best_seller_enabled ? (
                    <Badge variant="outline">
                        Rank {p.best_seller_rank ?? 'Auto'}
                    </Badge>
                ) : (
                    '-'
                ),
        },
    ];

    return (
        <>
            <Head title="Products" />
            <div className="space-y-6">
                <PageHeader
                    title="Products"
                    description="Manage your product catalog"
                    createUrl="/admin/products/create"
                />

                <DataTable
                    columns={columns}
                    data={products.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by name, SKU, or barcode..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(p) => `/admin/products/${p.id}/edit`}
                    deleteAction={(p) => deleteDialog.openDialog(p)}
                    rowKey={(p) => p.id}
                    customActions={(p) => (
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => void handleDuplicate(p)}
                            aria-label={`Duplicate ${p.name}`}
                            disabled={duplicatingId === p.id}
                        >
                            {duplicatingId === p.id ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </button>
                    )}
                />

                {/* Delete confirmation dialog */}
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/products/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="product"
                />
            </div>
        </>
    );
}
