import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export type StoreCardCategory = {
    id?: string;
    name: string;
    slug: string;
    image?: string;
    href?: string;
};

type Props = {
    category: StoreCardCategory;
    className?: string;
};

/**
 * Image-first category card with title overlay.
 * Designed for the shop-by-category grid on the storefront.
 */
export function CategoryCard({ category, className }: Props) {
    return (
        <Link
            href={category.href ?? `/categories/${category.slug}`}
            className={cn(
                'group relative flex aspect-[4/3] overflow-hidden rounded-2xl bg-muted/30 shadow-sm transition-shadow hover:shadow-md',
                className,
            )}
        >
            {/* Background image or placeholder */}
            {category.image ? (
                <img
                    src={category.image}
                    alt={category.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20">
                    <span className="text-4xl text-primary/30">🎈</span>
                </div>
            )}

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Title */}
            <div className="absolute right-0 bottom-0 left-0 p-4">
                <span className="text-sm font-semibold text-white">
                    {category.name}
                </span>
            </div>
        </Link>
    );
}
