import { Link, router } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

// Cart item from session
type CartItem = {
    line_key: string;
    product_id: string;
    variant_id: string | null;
    name: string;
    variant_name: string | null;
    price: string;
    quantity: number;
    image?: string | null;
    customization_text?: string | null;
    customization_primary_color?: { name: string } | null;
    add_ons?: Array<{ id: string; name: string }>;
};

type CartData = {
    items: CartItem[];
    count: number;
    total: string;
};

type Props = {
    cart: CartData;
    open: boolean;
    onClose: () => void;
};

/**
 * Slide-out cart panel for quick cart viewing.
 * Allows quantity changes and item removal from the overlay.
 */
export function CartSidebar({ cart, open, onClose }: Props) {
    // Update item quantity
    const updateQuantity = useCallback((lineKey: string, newQty: number) => {
        if (newQty <= 0) {
            return;
        }

        router.patch(
            '/cart/update',
            {
                line_key: lineKey,
                quantity: newQty,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, []);

    // Remove item from cart
    const removeItem = useCallback((lineKey: string) => {
        router.delete('/cart/remove', {
            data: {
                line_key: lineKey,
            },
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    if (!open) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/30 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="size-5" />
                        <span className="font-medium">Cart ({cart.count})</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="size-5" />
                    </Button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ShoppingCart className="mb-3 size-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                Your cart is empty
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {cart.items.map((item) => (
                                <li
                                    key={`${item.product_id}-${item.variant_id ?? 'base'}`}
                                    className="flex gap-3 rounded-lg border p-3"
                                >
                                    {/* Image thumb */}
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded bg-muted/30">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="size-full object-contain"
                                            />
                                        ) : (
                                            <ShoppingCart className="size-6 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    {/* Info + controls */}
                                    <div className="flex flex-1 flex-col gap-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                {item.variant_name && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.variant_name}
                                                    </p>
                                                )}
                                                {item.customization_primary_color && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Primary:{' '}
                                                        {
                                                            item
                                                                .customization_primary_color
                                                                .name
                                                        }
                                                    </p>
                                                )}
                                                {item.customization_text && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        Text:{' '}
                                                        {
                                                            item.customization_text
                                                        }
                                                    </p>
                                                )}
                                                {item.add_ons &&
                                                    item.add_ons.length > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Add-ons:{' '}
                                                            {item.add_ons
                                                                .map(
                                                                    (addOn) =>
                                                                        addOn.name,
                                                                )
                                                                .join(', ')}
                                                        </p>
                                                    )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    removeItem(item.line_key)
                                                }
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-6"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.line_key,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="size-3" />
                                                </Button>
                                                <span className="w-6 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-6"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.line_key,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-3" />
                                                </Button>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {formatCurrency(
                                                    Number(item.price) *
                                                        item.quantity,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer with total and actions */}
                {cart.items.length > 0 && (
                    <div className="space-y-3 border-t p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Total
                            </span>
                            <span className="text-lg font-semibold">
                                {formatCurrency(cart.total)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1"
                            >
                                <Link href="/cart" onClick={onClose}>
                                    View Cart
                                </Link>
                            </Button>
                            <Button asChild className="flex-1">
                                <Link href="/checkout" onClick={onClose}>
                                    Checkout
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
