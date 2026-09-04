import { Head, Link, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
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

// Category shape
type CategoryData = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image_path?: string | null;
    parent?: { id: string; name: string; slug: string } | null;
};

type Props = {
    category: CategoryData;
    subCategories: {
        id: string;
        name: string;
        slug: string;
        image_path?: string | null;
    }[];
    products: {
        data: StoreProduct[];
        meta: PaginationMeta;
        links: PaginationLinks;
    };
    filters: Record<string, string>;
};

/**
 * Category page with sub-categories and product listing.
 */
export default function CategoryShow({
    category,
    subCategories,
    products,
    filters,
}: Props) {
    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                `/categories/${category.id}`,
                { ...filters, [key]: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters, category.id],
    );

    return (
        <>
            <Head title={category.name} />
            <div className="space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">
                        Home
                    </Link>
                    <span>/</span>
                    {category.parent && (
                        <>
                            <Link
                                href={`/categories/${category.parent.id}`}
                                className="hover:text-foreground"
                            >
                                {category.parent.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-foreground">{category.name}</span>
                </nav>

                {/* Category header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Sub-categories */}
                {subCategories.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {subCategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/categories/${sub.id}`}
                                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary/50"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted/50 text-sm">
                                    {sub.image_path ? (
                                        <img
                                            src={sub.image_path}
                                            alt={sub.name}
                                            className="size-full rounded object-cover"
                                        />
                                    ) : (
                                        'S'
                                    )}
                                </div>
                                <span className="text-sm font-medium">
                                    {sub.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="Search in this category..."
                        value={filters.search ?? ''}
                        onChange={(e) => handleFilter('search', e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm sm:w-64"
                    />
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
                        No products in this category.
                    </p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {products.meta && products.meta.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {products.meta.from} to {products.meta.to}{' '}
                            of {products.meta.total} results
                        </span>
                        <div className="flex gap-2">
                            {products.links.prev && (
                                <Link
                                    href={products.links.prev}
                                    preserveState
                                    preserveScroll
                                    className="rounded-md border px-3 py-1 hover:bg-muted"
                                >
                                    Previous
                                </Link>
                            )}
                            <span className="px-2 py-1">
                                Page {products.meta.current_page} of{' '}
                                {products.meta.last_page}
                            </span>
                            {products.links.next && (
                                <Link
                                    href={products.links.next}
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
