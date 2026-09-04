import { Head, Link } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

type OrderItem = {
    id: string;
    parent_order_item_id?: string | null;
    product_name: string;
    quantity: string;
    unit_price: string;
    total: string;
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
    child_items?: Array<{
        id: string;
        product_name: string;
        quantity: string;
        total: string;
    }>;
    product?: { id: string; name: string; preorder?: boolean } | null;
};

type Order = {
    id: string;
    order_number: string;
    status: string;
    total: string;
    subtotal: string;
    shipping_amount: string;
    fulfillment_type: string;
    delivery_postcode?: string | null;
    placed_at: string;
    items: OrderItem[];
    delivery_zone?: { id: number; name: string } | null;
    customer?: {
        first_name: string;
        last_name: string;
        email: string;
    } | null;
};

type Props = {
    order: Order;
};

/**
 * Order confirmation page shown after successful checkout.
 */
export default function OrderConfirmation({ order }: Props) {
    return (
        <>
            <Head title="Order Confirmed" />
            <div className="space-y-8 py-8">
                {/* Success */}
                <div className="flex flex-col items-center text-center">
                    <CheckCircle className="mb-4 size-16 text-green-500" />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Thank You!
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Your order has been placed successfully.
                    </p>
                </div>

                {/* Order details */}
                <div className="mx-auto max-w-lg space-y-4">
                    <div className="rounded-lg border p-6">
                        <h2 className="text-lg font-medium">Order Details</h2>
                        <div className="mt-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Order Number
                                </span>
                                <span className="font-mono font-medium">
                                    {order.order_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Date
                                </span>
                                <span>
                                    {new Date(order.placed_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <span className="capitalize">
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Fulfillment
                                </span>
                                <span className="capitalize">
                                    {order.fulfillment_type}
                                </span>
                            </div>
                            {order.fulfillment_type === 'delivery' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Delivery Zone
                                        </span>
                                        <span>
                                            {order.delivery_zone?.name ??
                                                'Matched at checkout'}
                                        </span>
                                    </div>
                                    {order.delivery_postcode && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Postcode
                                            </span>
                                            <span>
                                                {order.delivery_postcode}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Items */}
                        <div className="mt-4 space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Items
                            </h3>
                            <ul className="space-y-1 text-sm">
                                {order.items.map((item) => (
                                    <li key={item.id} className="space-y-1">
                                        <div className="flex justify-between gap-3">
                                            <span>
                                                {item.product_name} x
                                                {item.quantity}
                                            </span>
                                            <span>
                                                {formatCurrency(item.total)}
                                            </span>
                                        </div>
                                        {(item.customization_primary_color ||
                                            item.customization_secondary_color ||
                                            item.customization_text ||
                                            item.customization_font) && (
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                {item.customization_primary_color && (
                                                    <p>
                                                        Primary:{' '}
                                                        {
                                                            item
                                                                .customization_primary_color
                                                                .name
                                                        }
                                                    </p>
                                                )}
                                                {item.customization_secondary_color && (
                                                    <p>
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
                                                        {
                                                            item.customization_text
                                                        }
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
                                        {item.child_items &&
                                            item.child_items.length > 0 && (
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                    {item.child_items.map(
                                                        (childItem) => (
                                                            <p
                                                                key={
                                                                    childItem.id
                                                                }
                                                            >
                                                                Add-on:{' '}
                                                                {
                                                                    childItem.product_name
                                                                }{' '}
                                                                x
                                                                {
                                                                    childItem.quantity
                                                                }{' '}
                                                                -{' '}
                                                                {formatCurrency(
                                                                    childItem.total,
                                                                )}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        {item.product?.preorder && (
                                            <p className="text-xs text-amber-700">
                                                This item was placed as a
                                                preorder and may have an
                                                extended fulfilment time.
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Total */}
                        <div className="mt-4 space-y-1 border-t pt-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Delivery
                                </span>
                                <span>
                                    {Number(order.shipping_amount) > 0
                                        ? formatCurrency(order.shipping_amount)
                                        : 'Free'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between border-t pt-2 text-base font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>

                    {/* Customer info */}
                    {order.customer && (
                        <div className="rounded-lg border p-4 text-sm">
                            <p>
                                A confirmation email will be sent to{' '}
                                <span className="font-medium">
                                    {order.customer.email}
                                </span>
                                .
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button asChild className="flex-1">
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/orders/track">Track Order</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
