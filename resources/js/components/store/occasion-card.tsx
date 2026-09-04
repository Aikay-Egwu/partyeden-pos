import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export type Occasion = {
    name: string;
    slug: string;
    image?: string;
    icon?: string;
};

type Props = {
    occasion: Occasion;
    className?: string;
};

/**
 * Large rounded occasion card with lifestyle image and label.
 * Uses hover scale + shadow animation for a playful feel.
 */
export function OccasionCard({ occasion, className }: Props) {
    return (
        <Link
            href={`/occasions/${occasion.slug}`}
            className={cn(
                'group flex flex-col items-center gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md',
                className,
            )}
        >
            {/* Image area */}
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted/50">
                {occasion.image ? (
                    <img
                        src={occasion.image}
                        alt={occasion.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-4xl text-muted-foreground/40">
                        {occasion.icon ?? '🎈'}
                    </div>
                )}
            </div>
            {/* Label */}
            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                {occasion.name}
            </span>
        </Link>
    );
}
