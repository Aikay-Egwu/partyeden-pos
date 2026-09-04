import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

type ColorOption = {
    id: string;
    name: string;
    hex_code: string | null;
};

type KitMapping = {
    id: string;
    quantity: string;
    component?: { id: string; name: string } | null;
};

type OrderItem = {
    id: string;
    parent_order_item_id?: string | null;
    quantity: string;
    unit_price: string;
    total: string;
    customization_text?: string | null;
    customization_font?: string | null;
    customizationPrimaryColor?: ColorOption | null;
    customizationSecondaryColor?: ColorOption | null;
    product?: {
        id: string;
        name: string;
        sku: string;
        product_type?: string;
        kitMappings?: KitMapping[] | null;
    } | null;
    variant?: { id: string; name: string } | null;
    childItems?: Array<{
        id: string;
        quantity: string;
        total: string;
        product?: { id: string; name: string } | null;
    }>;
};

type Order = {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    created_at: string;
    subtotal: string;
    discount_amount: string;
    shipping_amount: string;
    total: string;
    notes: string | null;
    fulfillment_type?: string | null;
    delivery_postcode?: string | null;
    customer?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
    deliveryZone?: { id: string; name: string } | null;
    items: OrderItem[];
};

type Props = {
    order: Order;
};

/**
 * Print-friendly pick list for fulfilment staff.
 * Uses a layout-free page so the browser print output only contains the pick list.
 */
export default function OrderPrint({ order }: Props) {
    useEffect(() => {
        const timer = window.setTimeout(() => window.print(), 150);

        return () => window.clearTimeout(timer);
    }, []);

    const parentItems = order.items.filter(
        (item) => !item.parent_order_item_id,
    );

    return (
        <>
            <Head title={`Print ${order.order_number}`} />
            <div className="mx-auto max-w-4xl space-y-6 bg-background p-6 text-sm text-foreground print:max-w-none print:p-0">
                <div className="flex items-start justify-between border-b pb-4 print:hidden">
                    <div>
                        <h1 className="text-2xl font-semibold">Pick List</h1>
                        <p className="text-muted-foreground">
                            Order {order.order_number}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            Print Again
                        </Button>
                        <Button variant="ghost" onClick={() => window.close()}>
                            Close
                        </Button>
                    </div>
                </div>

                <div className="space-y-1 border-b pb-4">
                    <h1 className="text-2xl font-semibold">
                        Order {order.order_number}
                    </h1>
                    <p className="text-muted-foreground">
                        Placed {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <section className="rounded-lg border p-4">
                        <h2 className="mb-2 font-semibold">Customer</h2>
                        <p>
                            {order.customer
                                ? `${order.customer.first_name} ${order.customer.last_name}`
                                : 'Guest'}
                        </p>
                        <p className="text-muted-foreground">
                            {order.customer?.email ?? 'No email provided'}
                        </p>
                    </section>

                    <section className="rounded-lg border p-4">
                        <h2 className="mb-2 font-semibold">Fulfillment</h2>
                        <p className="capitalize">
                            {order.fulfillment_type ?? 'Pickup'}
                        </p>
                        {order.fulfillment_type === 'delivery' && (
                            <div className="mt-2 space-y-1 text-muted-foreground">
                                <p>Zone: {order.deliveryZone?.name ?? '-'}</p>
                                <p>
                                    Postcode: {order.delivery_postcode ?? '-'}
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="rounded-lg border p-4">
                        <h2 className="mb-2 font-semibold">Order Status</h2>
                        <p className="capitalize">Status: {order.status}</p>
                        <p className="text-muted-foreground capitalize">
                            Payment: {order.payment_status}
                        </p>
                    </section>
                </div>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Items to Prepare</h2>

                    {parentItems.map((item, index) => (
                        <article
                            key={item.id}
                            className="rounded-lg border p-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-3">
                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Item {index + 1}
                                    </p>
                                    <h3 className="font-semibold">
                                        {item.product?.name ??
                                            'Unknown product'}
                                        {item.variant && (
                                            <span className="font-normal text-muted-foreground">
                                                {' '}
                                                ({item.variant.name})
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        SKU: {item.product?.sku ?? '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        Qty {item.quantity}
                                    </p>
                                    <p className="text-muted-foreground">
                                        Line total {formatCurrency(item.total)}
                                    </p>
                                </div>
                            </div>

                            {(item.customization_text ||
                                item.customization_font ||
                                item.customizationPrimaryColor ||
                                item.customizationSecondaryColor) && (
                                <div className="mt-3 space-y-1">
                                    <h4 className="font-medium">
                                        Customisation
                                    </h4>
                                    {item.customization_text && (
                                        <p>Text: {item.customization_text}</p>
                                    )}
                                    {item.customization_font && (
                                        <p>Font: {item.customization_font}</p>
                                    )}
                                    {item.customizationPrimaryColor && (
                                        <p>
                                            Primary color:{' '}
                                            {
                                                item.customizationPrimaryColor
                                                    .name
                                            }
                                        </p>
                                    )}
                                    {item.customizationSecondaryColor && (
                                        <p>
                                            Secondary color:{' '}
                                            {
                                                item.customizationSecondaryColor
                                                    .name
                                            }
                                        </p>
                                    )}
                                </div>
                            )}

                            {item.product?.product_type === 'kit' &&
                                item.product.kitMappings &&
                                item.product.kitMappings.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        <h4 className="font-medium">
                                            Kit Components
                                        </h4>
                                        <ul className="list-disc pl-5">
                                            {item.product.kitMappings.map(
                                                (mapping) => (
                                                    <li key={mapping.id}>
                                                        {mapping.quantity} x{' '}
                                                        {mapping.component
                                                            ?.name ??
                                                            'Unknown component'}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}

                            {item.childItems && item.childItems.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    <h4 className="font-medium">Add-ons</h4>
                                    <ul className="list-disc pl-5">
                                        {item.childItems.map((childItem) => (
                                            <li key={childItem.id}>
                                                {childItem.product?.name ??
                                                    'Unknown add-on'}{' '}
                                                x {childItem.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </article>
                    ))}
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-2 font-semibold">Notes</h2>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                            {order.notes ?? 'No preparation notes provided.'}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h2 className="mb-2 font-semibold">Totals</h2>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Discount
                                    </span>
                                    <span>
                                        -{formatCurrency(order.discount_amount)}
                                    </span>
                                </div>
                            )}
                            {Number(order.shipping_amount) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Delivery
                                    </span>
                                    <span>
                                        {formatCurrency(order.shipping_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
