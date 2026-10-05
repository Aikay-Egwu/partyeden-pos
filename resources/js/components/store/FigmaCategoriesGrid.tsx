import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Category fields sent by the storefront home controller.
 */
export type FigmaCategoryCard = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
};

/**
 * Props for the FigmaCategoriesGrid component.
 */
export type FigmaCategoriesGridProps = {
    categories: FigmaCategoryCard[];
    totalCategories: number;
    className?: string;
    id?: string;
};

/**
 * Popular party categories populated from the active catalog categories.
 */
export function FigmaCategoriesGrid({
    categories,
    totalCategories,
    className,
    id,
}: FigmaCategoriesGridProps) {
    return (
        <section
            id={id}
            aria-label="Popular party categories"
            className={cn(
                'w-full bg-popjoy-bg px-5 py-16 sm:px-8 lg:px-12 lg:py-20',
                className,
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                            EXPLORE CURATED COLLECTIONS
                        </span>
                        <h2 className="font-plus-jakarta text-3xl leading-9 font-bold text-popjoy-ink">
                            Popular Party Categories
                        </h2>
                    </div>
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-1 text-sm font-bold text-popjoy-purple transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-popjoy-purple"
                    >
                        View all {totalCategories} categories
                        <img
                            src="/figma-img/muhjqso4-bvin15f.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-2 w-[5px]"
                        />
                    </Link>
                </div>

                {categories.length === 0 ? (
                    <p className="rounded-2xl border border-popjoy-divider/50 bg-white px-6 py-10 text-center text-sm text-popjoy-muted">
                        Categories are being prepared. Please check back soon.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className="group flex flex-col items-center rounded-3xl border border-popjoy-divider/50 bg-white p-4 text-center transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                            >
                                <div
                                    className={cn(
                                        'mb-4 flex aspect-square w-full max-w-36 items-center justify-center overflow-hidden rounded-full border-2 bg-popjoy-bg',
                                        index % 2 === 0
                                            ? 'border-[#eaddff]'
                                            : 'border-[#ffdf9a]',
                                    )}
                                >
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt=""
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Sparkles
                                            aria-hidden="true"
                                            className="size-9 text-popjoy-purple/50"
                                        />
                                    )}
                                </div>
                                <span className="font-plus-jakarta text-sm leading-5 font-bold text-popjoy-ink">
                                    {category.name}
                                </span>
                                <span className="mt-1 line-clamp-2 text-[11px] leading-[17px] text-popjoy-muted">
                                    {category.description ||
                                        'Explore the collection'}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
