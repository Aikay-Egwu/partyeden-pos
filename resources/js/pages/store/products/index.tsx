import { Head, Link, router } from '@inertiajs/react';
import { useCallback } from 'react';
import { ProductCard } from '@/components/store/product-card';

// Product shape from controller
type StoreProduct = {
    id: string;
    name: string;
    sku: string;
    selling_price: string;
    product_type: string;
    is_active: boolean;
    category?: { id: string; name: string } | null;
    primary_image?: string | null;
};

type Props = {
    products: {
        data: StoreProduct[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    categories: { id: string; name: string }[];
    filters: Record<string, string>;
};

/**
 * Product listing page with search, category filter, and sort.
 */
export default function ProductListing({
    products,
    categories,
    filters,
}: Props) {
    // Handle filter changes with page reload
    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                '/products',
                { ...filters, [key]: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    return (
        <>
            <Head title="Products" />
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        All Products
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Browse our full catalog
                    </p>
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search ?? ''}
                        onChange={(e) => handleFilter('search', e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm sm:w-64"
                    />

                    {/* Category filter */}
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.category ?? ''}
                        onChange={(e) =>
                            handleFilter('category', e.target.value)
                        }
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.sort ?? 'newest'}
                        onChange={(e) => handleFilter('sort', e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="name">Name A-Z</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>

                {/* Products grid */}
                {products.data.length === 0 ? (
                    <p className="py-12 text-center text-muted-foreground">
                        No products found.
                    </p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {products.from} to {products.to} of{' '}
                            {products.total} results
                        </span>
                        <div className="flex gap-2">
                            {products.prev_page_url && (
                                <Link
                                    href={products.prev_page_url}
                                    preserveState
                                    preserveScroll
                                    className="rounded-md border px-3 py-1 hover:bg-muted"
                                >
                                    Previous
                                </Link>
                            )}
                            <span className="px-2 py-1">
                                Page {products.current_page} of{' '}
                                {products.last_page}
                            </span>
                            {products.next_page_url && (
                                <Link
                                    href={products.next_page_url}
                                    preserveState
                                    preserveScroll
                                    className="rounded-md border px-3 py-1 hover:bg-muted"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
