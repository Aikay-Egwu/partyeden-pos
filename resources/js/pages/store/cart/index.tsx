import { Head, Link, router } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

// Cart shape from CartService
type CartItem = {
    line_key: string;
    product_id: string;
    variant_id: string | null;
    name: string;
    variant_name: string | null;
    product_type: string;
    preorder: boolean;
    price: string;
    quantity: number;
    product_line_total: string;
    add_on_total: string;
    line_total: string;
    image?: string | null;
    customization_text?: string | null;
    customization_font?: string | null;
    customization_primary_color?: {
        id: number;
        name: string;
        hex_code: string | null;
    } | null;
    customization_secondary_color?: {
        id: number;
        name: string;
        hex_code: string | null;
    } | null;
    is_customized: boolean;
    add_ons?: Array<{
        id: string;
        name: string;
        price: string;
        quantity: number;
        line_total: string;
    }>;
    kit_components?: Array<{
        id: string;
        quantity: string;
        component_name?: string | null;
        variant_name?: string | null;
    }>;
};

type CartData = {
    items: CartItem[];
    count: number;
    total: string;
};

type Props = {
    cart: CartData;
};

/**
 * Full cart page with line items, quantity controls, and totals.
 */
export default function CartPage({ cart }: Props) {
    const updateQuantity = (lineKey: string, newQty: number) => {
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
    };

    const removeItem = (lineKey: string) => {
        router.delete('/cart/remove', {
            data: {
                line_key: lineKey,
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Shopping Cart" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Shopping Cart
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {cart.count} {cart.count === 1 ? 'item' : 'items'}
                    </p>
                </div>

                {cart.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ShoppingCart className="mb-4 size-16 text-muted-foreground/30" />
                        <h2 className="text-lg font-medium">
                            Your cart is empty
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Looks like you haven&apos;t added anything yet.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/products">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Cart items */}
                        <div className="space-y-4 lg:col-span-2">
                            {cart.items.map((item) => (
                                <div
                                    key={`${item.product_id}-${item.variant_id ?? 'base'}`}
                                    className="flex gap-4 rounded-lg border p-4"
                                >
                                    {/* Image */}
                                    <div className="flex size-20 shrink-0 items-center justify-center rounded bg-muted/30">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="size-full object-contain"
                                            />
                                        ) : (
                                            <ShoppingCart className="size-8 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {item.name}
                                                </p>
                                                {item.variant_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.variant_name}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {item.product_type ===
                                                        'kit' && (
                                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                            Kit
                                                        </span>
                                                    )}
                                                    {item.is_customized && (
                                                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                                                            Customized
                                                        </span>
                                                    )}
                                                    {item.preorder && (
                                                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                                            Preorder
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(item.price)}{' '}
                                                    each
                                                </p>
                                                {item.kit_components &&
                                                    item.kit_components.length >
                                                        0 && (
                                                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                            <p className="font-medium text-foreground">
                                                                What&apos;s
                                                                included
                                                            </p>
                                                            {item.kit_components.map(
                                                                (component) => (
                                                                    <p
                                                                        key={
                                                                            component.id
                                                                        }
                                                                    >
                                                                        {
                                                                            component.component_name
                                                                        }
                                                                        {component.variant_name &&
                                                                            ` (${component.variant_name})`}{' '}
                                                                        x
                                                                        {
                                                                            component.quantity
                                                                        }
                                                                    </p>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                {(item.customization_primary_color ||
                                                    item.customization_secondary_color ||
                                                    item.customization_text ||
                                                    item.customization_font) && (
                                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                        {item.customization_primary_color && (
                                                            <p className="flex items-center gap-2">
                                                                <span
                                                                    className="size-3 rounded-full border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .customization_primary_color
                                                                                .hex_code ??
                                                                            '#ffffff',
                                                                    }}
                                                                />
                                                                Primary:{' '}
                                                                {
                                                                    item
                                                                        .customization_primary_color
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                        {item.customization_secondary_color && (
                                                            <p className="flex items-center gap-2">
                                                                <span
                                                                    className="size-3 rounded-full border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .customization_secondary_color
                                                                                .hex_code ??
                                                                            '#ffffff',
                                                                    }}
                                                                />
                                                                Secondary:{' '}
                                                                {
                                                                    item
                                                                        .customization_secondary_color
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                        {item.customization_text && (
                                                            <p>
                                                                Text:{' '}
                                                                {item
                                                                    .customization_text
                                                                    .length > 60
                                                                    ? `${item.customization_text.slice(0, 60)}...`
                                                                    : item.customization_text}
                                                            </p>
                                                        )}
                                                        {item.customization_font && (
                                                            <p>
                                                                Font:{' '}
                                                                {
                                                                    item.customization_font
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {item.add_ons &&
                                                    item.add_ons.length > 0 && (
                                                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                            <p className="font-medium text-foreground">
                                                                Add-ons
                                                            </p>
                                                            {item.add_ons.map(
                                                                (addOn) => (
                                                                    <p
                                                                        key={
                                                                            addOn.id
                                                                        }
                                                                    >
                                                                        {
                                                                            addOn.name
                                                                        }{' '}
                                                                        x
                                                                        {
                                                                            addOn.quantity
                                                                        }{' '}
                                                                        -{' '}
                                                                        {formatCurrency(
                                                                            addOn.line_total,
                                                                        )}
                                                                    </p>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    removeItem(item.line_key)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center rounded-md border">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.line_key,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="px-2 py-1 hover:bg-muted"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>
                                                <span className="min-w-10 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.line_key,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="px-2 py-1 hover:bg-muted"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatCurrency(
                                                        item.line_total,
                                                    )}
                                                </p>
                                                {Number(item.add_on_total) >
                                                    0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Includes{' '}
                                                        {formatCurrency(
                                                            item.add_on_total,
                                                        )}{' '}
                                                        add-ons
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order summary */}
                        <div className="h-fit space-y-4 rounded-lg border p-6">
                            <h2 className="text-lg font-medium">
                                Order Summary
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>{formatCurrency(cart.total)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                    <span>Total</span>
                                    <span>{formatCurrency(cart.total)}</span>
                                </div>
                            </div>
                            <Button asChild className="w-full">
                                <Link href="/checkout">
                                    Proceed to Checkout
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
