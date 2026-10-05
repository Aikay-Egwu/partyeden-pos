import { Head, Link } from '@inertiajs/react';
import { CatalogSearch } from '@/components/store/catalog-search';
import { CategoryCard } from '@/components/store/category-card';

type StoreCategory = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
};

type Props = {
    categories: StoreCategory[];
    filters: {
        search: string;
    };
};

export default function CategoryIndex({ categories, filters }: Props) {
    return (
        <>
            <Head title="All categories" />
            <div className="-mx-4 -my-6 min-h-screen bg-popjoy-bg px-4 py-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Breadcrumbs */}
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-8 flex items-center gap-2 text-sm text-popjoy-muted"
                    >
                        <Link
                            href="/"
                            className="transition-colors hover:text-popjoy-purple"
                        >
                            Home
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page" className="text-popjoy-ink">
                            Categories
                        </span>
                    </nav>

                    <header className="mb-10 max-w-2xl">
                        <p className="text-xs font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                            FIND YOUR CELEBRATION
                        </p>
                        <h1 className="mt-2 font-plus-jakarta text-3xl font-bold text-popjoy-ink sm:text-4xl">
                            All categories
                        </h1>
                        <p className="mt-3 text-base leading-relaxed text-popjoy-muted">
                            Explore every collection, from statement balloons to
                            thoughtful finishing touches.
                        </p>
                        <CatalogSearch
                            className="mt-6 max-w-xl"
                            initialType="categories"
                            placeholder="Search themes and categories..."
                            value={filters.search}
                        />
                        <p className="mt-5 text-sm font-semibold text-popjoy-ink">
                            {categories.length}{' '}
                            {categories.length === 1
                                ? 'category'
                                : 'categories'}
                        </p>
                    </header>

                    {categories.length === 0 ? (
                        <p className="rounded-2xl border border-popjoy-divider/50 bg-white px-6 py-12 text-center text-sm text-popjoy-muted">
                            {filters.search
                                ? `No categories match “${filters.search}”. Try another search.`
                                : 'No categories are available just yet. Please check back soon.'}
                        </p>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {categories.map((category) => (
                                <div key={category.id} className="space-y-2">
                                    <CategoryCard
                                        category={{
                                            id: category.id,
                                            name: category.name,
                                            slug: category.slug,
                                            href: `/categories/${category.id}`,
                                            image: category.image ?? undefined,
                                        }}
                                        className="rounded-3xl"
                                    />
                                    {category.description && (
                                        <p className="line-clamp-2 px-1 text-sm leading-relaxed text-popjoy-muted">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
