import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

// Product shape for storefront cards
type StoreProduct = {
    id: string;
    name: string;
    sku: string;
    selling_price: string;
    product_type: string;
    is_active: boolean;
    category?: { id: string; name: string } | null;
    // First image URL, if any
    primary_image?: string | null;
};

type Props = {
    product: StoreProduct;
};

/**
 * Product card for storefront grid display.
 * Shows image placeholder, name, price, category, and Add to Cart.
 */
export function ProductCard({ product }: Props) {
    /* const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        router.post(
            '/cart/add',
            {
                product_id: product.id,
                quantity: 1,
            },
            {
                preserveScroll: true,
            },
        );
    }; */

    return (
        <div className="group flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
            {/* Product image */}
            <Link href={`/products/${product.id}`}>
                <div className="flex aspect-square items-center justify-center bg-muted/30 p-6">
                    {product.primary_image ? (
                        <img
                            src={product.primary_image}
                            alt={product.name}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <ShoppingCart className="size-12 text-muted-foreground/40" />
                    )}
                </div>
            </Link>

            {/* Product info */}
            <div className="flex flex-1 flex-col gap-2 p-4">
                {/* Category tag */}
                {product.category && (
                    <span className="text-xs text-muted-foreground">
                        {product.category.name}
                    </span>
                )}

                {/* Name */}
                <Link
                    href={`/products/${product.id}`}
                    className="text-sm leading-snug font-medium group-hover:text-primary"
                >
                    {product.name}
                </Link>

                {/* Price and Add to Cart */}
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-base font-semibold">
                        {formatCurrency(product.selling_price)}
                    </span>
                    <Link href={`/products/${product.id}`} className="gap-1">
                        <Button size="sm" className="gap-1">
                            <ShoppingCart className="size-4" />
                            Select
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
