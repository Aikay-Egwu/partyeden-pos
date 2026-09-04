import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Testimonial = {
    name: string;
    role?: string;
    avatar?: string;
    quote: string;
    rating: number; // 1-5
};

type Props = {
    testimonial: Testimonial;
    className?: string;
};

/**
 * Minimal testimonial card with avatar, rating stars, and quote.
 */
export function TestimonialCard({ testimonial, className }: Props) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm',
                className,
            )}
        >
            {/* Stars */}
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            'size-4',
                            i < testimonial.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30',
                        )}
                    />
                ))}
            </div>

            {/* Quote */}
            <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="mt-auto flex items-center gap-3">
                {testimonial.avatar ? (
                    <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="size-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {testimonial.name.charAt(0)}
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {testimonial.name}
                    </p>
                    {testimonial.role && (
                        <p className="text-xs text-muted-foreground">
                            {testimonial.role}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
