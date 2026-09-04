import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { ProductCard } from '@/components/store/product-card';
import { cn } from '@/lib/utils';

// Product shape matching ProductCard expectations
type CarouselProduct = {
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
    products: CarouselProduct[];
    className?: string;
};

/**
 * Horizontal product carousel with scroll buttons.
 * Touch-friendly with native scroll snapping.
 */
export function ProductCarousel({ products, className }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = useCallback(() => {
        const el = scrollRef.current;

        if (!el) {
            return;
        }

        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;

        if (!el) {
            return;
        }

        const scrollAmount = el.clientWidth * 0.75;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className={cn('relative', className)}>
            {/* Left arrow */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scroll('left')}
                    className="absolute top-1/2 -left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-shadow hover:shadow-lg"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="size-5" />
                </button>
            )}

            {/* Scrollable track */}
            <div
                ref={scrollRef}
                onScroll={updateScrollButtons}
                className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="w-[260px] shrink-0 snap-start sm:w-[280px]"
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Right arrow */}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scroll('right')}
                    className="absolute top-1/2 -right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-shadow hover:shadow-lg"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="size-5" />
                </button>
            )}
        </div>
    );
}
