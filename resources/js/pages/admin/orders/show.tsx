import { Head, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

type OrderItem = {
    id: string;
    parent_order_item_id?: string | null;
    quantity: string;
    unit_price: string;
    total: string;
    customization_text?: string | null;
    customization_font?: string | null;
    customizationPrimaryColor?: {
        id: string;
        name: string;
        hex_code: string;
    } | null;
    customizationSecondaryColor?: {
        id: string;
        name: string;
        hex_code: string;
    } | null;
    product?: {
        id: string;
        name: string;
        sku: string;
        product_type?: string;
        kitMappings?:
            | {
                  id: string;
                  quantity: string;
                  component?: { id: string; name: string } | null;
              }[]
            | null;
    } | null;
    variant?: { id: string; name: string } | null;
    childItems?: OrderItem[];
};

type Shipment = {
    id: string;
    tracking_number: string | null;
    carrier: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
};

type Order = {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string | null;
    paypal_order_id: string | null;
    paypal_capture_id: string | null;
    paypal_payer_email: string | null;
    paypal_payer_id: string | null;
    amount_paid: string | null;
    paid_at: string | null;
    subtotal: string;
    tax_amount: string;
    discount_amount: string;
    shipping_amount: string;
    total: string;
    notes: string | null;
    shipping_address: string | null;
    billing_address: string | null;
    created_at: string;
    fulfillment_type?: string | null;
    delivery_postcode?: string | null;
    customer?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
    location?: { id: string; name: string } | null;
    createdBy?: { id: string; name: string } | null;
    items: OrderItem[];
    shipments: Shipment[];
    deliveryZone?: { id: string; name: string } | null;
};

type Props = {
    order: Order;
    statusTransitions: string[];
};

/**
 * Order detail page with items, shipments, and summary.
 */
export default function OrderShow({ order, statusTransitions }: Props) {
    const handleStatusUpdate = (status: string) => {
        if (!confirm(`Change order status to ${status}?`)) {
            return;
        }

        router.patch(
            `/admin/orders/${order.id}/status`,
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <PageHeader
                        title={`Order ${order.order_number}`}
                        description={`Placed on ${new Date(order.created_at).toLocaleString()}`}
                    />
                    <Button
                        variant="outline"
                        onClick={() =>
                            window.open(
                                `/admin/orders/${order.id}/print`,
                                '_blank',
                            )
                        }
                    >
                        <Printer className="mr-2 size-4" />
                        Print Pick List
                    </Button>
                </div>

                <div className="flex justify-end">
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                            <StatusBadge value={order.status} />
                            <StatusBadge value={order.payment_status} />
                        </div>
                        {statusTransitions.length > 0 && (
                            <div className="flex gap-2">
                                {statusTransitions.map((status) => (
                                    <Button
                                        key={status}
                                        onClick={() =>
                                            handleStatusUpdate(status)
                                        }
                                        variant={
                                            status === 'cancelled'
                                                ? 'destructive'
                                                : 'default'
                                        }
                                        size="sm"
                                        className="capitalize"
                                    >
                                        Mark {status}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info grid */}
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Customer
                        </span>
                        <p className="text-sm font-medium">
                            {order.customer
                                ? `${order.customer.first_name} ${order.customer.last_name}`
                                : 'Guest'}
                        </p>
                        {order.customer?.email && (
                            <p className="text-xs text-muted-foreground">
                                {order.customer.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Fulfillment
                        </span>
                        <p className="text-sm font-medium capitalize">
                            {order.fulfillment_type ?? '-'}
                        </p>
                        {order.fulfillment_type === 'delivery' && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Postcode: {order.delivery_postcode ?? '-'}
                                <br />
                                Zone: {order.deliveryZone?.name ?? '-'}
                            </p>
                        )}
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Created By
                        </span>
                        <p className="text-sm font-medium">
                            {order.createdBy?.name ?? '-'}
                        </p>
                    </div>
                </div>

                {/* Line items */}
                <div className="space-y-2">
                    <h2 className="text-lg font-medium">Items</h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                        Product
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                        SKU
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                        Qty
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                        Price
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items
                                    .filter(
                                        (item) => !item.parent_order_item_id,
                                    )
                                    .map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {item.product?.name ?? '-'}
                                                    {item.variant && (
                                                        <span className="font-normal text-muted-foreground">
                                                            {' '}
                                                            -{' '}
                                                            {item.variant.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Kit Components */}
                                                {item.product?.product_type ===
                                                    'kit' &&
                                                    item.product.kitMappings &&
                                                    item.product.kitMappings
                                                        .length > 0 && (
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            <strong>
                                                                Kit Components:
                                                            </strong>
                                                            <ul className="mt-0.5 list-inside list-disc">
                                                                {item.product.kitMappings.map(
                                                                    (
                                                                        mapping,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                mapping.id
                                                                            }
                                                                        >
                                                                            {parseFloat(
                                                                                mapping.quantity,
                                                                            )}
                                                                            x{' '}
                                                                            {mapping
                                                                                .component
                                                                                ?.name ??
                                                                                'Unknown'}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}

                                                {/* Customisation Details */}
                                                {(item.customization_text ||
                                                    item.customizationPrimaryColor ||
                                                    item.customizationSecondaryColor) && (
                                                    <div className="mt-2 space-y-1 border-l-2 border-primary/20 pl-2 text-xs">
                                                        {item.customization_text && (
                                                            <p>
                                                                <strong>
                                                                    Text:
                                                                </strong>{' '}
                                                                {
                                                                    item.customization_text
                                                                }{' '}
                                                                {item.customization_font
                                                                    ? `(${item.customization_font})`
                                                                    : ''}
                                                            </p>
                                                        )}
                                                        {item.customizationPrimaryColor && (
                                                            <p className="flex items-center gap-1">
                                                                <strong>
                                                                    Primary
                                                                    Color:
                                                                </strong>
                                                                <span
                                                                    className="inline-block h-3 w-3 rounded-full border border-black/10"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .customizationPrimaryColor
                                                                                .hex_code,
                                                                    }}
                                                                    title={
                                                                        item
                                                                            .customizationPrimaryColor
                                                                            .name
                                                                    }
                                                                />
                                                                {
                                                                    item
                                                                        .customizationPrimaryColor
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                        {item.customizationSecondaryColor && (
                                                            <p className="flex items-center gap-1">
                                                                <strong>
                                                                    Secondary
                                                                    Color:
                                                                </strong>
                                                                <span
                                                                    className="inline-block h-3 w-3 rounded-full border border-black/10"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .customizationSecondaryColor
                                                                                .hex_code,
                                                                    }}
                                                                    title={
                                                                        item
                                                                            .customizationSecondaryColor
                                                                            .name
                                                                    }
                                                                />
                                                                {
                                                                    item
                                                                        .customizationSecondaryColor
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Child Items (Add-ons) */}
                                                {item.childItems &&
                                                    item.childItems.length >
                                                        0 && (
                                                        <div className="mt-2 text-xs text-muted-foreground">
                                                            <strong>
                                                                Add-ons:
                                                            </strong>
                                                            <ul className="mt-0.5 space-y-0.5">
                                                                {item.childItems.map(
                                                                    (child) => (
                                                                        <li
                                                                            key={
                                                                                child.id
                                                                            }
                                                                            className="flex justify-between"
                                                                        >
                                                                            <span>
                                                                                {child
                                                                                    .product
                                                                                    ?.name ??
                                                                                    '-'}{' '}
                                                                                (x
                                                                                {
                                                                                    child.quantity
                                                                                }

                                                                                )
                                                                            </span>
                                                                            <span>
                                                                                {formatCurrency(
                                                                                    child.total,
                                                                                )}
                                                                            </span>
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.product?.sku ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatCurrency(
                                                    item.unit_price,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="ml-auto max-w-xs space-y-1 rounded-lg border p-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(order.tax_amount)}</span>
                    </div>
                    {Number(order.discount_amount) > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>
                                -{formatCurrency(order.discount_amount)}
                            </span>
                        </div>
                    )}
                    {Number(order.shipping_amount) > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Shipping
                            </span>
                            <span>{formatCurrency(order.shipping_amount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t pt-1 font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                </div>

                {/* Shipments */}
                {order.shipments.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-medium">Shipments</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Tracking
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Carrier
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Shipped
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Delivered
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.shipments.map((s) => (
                                        <tr
                                            key={s.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-2">
                                                {s.tracking_number ?? '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {s.carrier ?? '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <StatusBadge value={s.status} />
                                            </td>
                                            <td className="px-4 py-2">
                                                {s.shipped_at
                                                    ? new Date(
                                                          s.shipped_at,
                                                      ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {s.delivered_at
                                                    ? new Date(
                                                          s.delivered_at,
                                                      ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Payment details (PayPal) */}
                {order.payment_method === 'paypal' && (
                    <div className="space-y-2 rounded-lg border p-4 text-sm">
                        <h2 className="mb-2 text-lg font-medium">
                            Payment Details
                        </h2>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {order.paypal_order_id && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        PayPal Order ID
                                    </span>
                                    <p className="font-mono text-xs break-all">
                                        {order.paypal_order_id}
                                    </p>
                                </div>
                            )}
                            {order.paypal_capture_id && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        PayPal Capture ID
                                    </span>
                                    <p className="font-mono text-xs break-all">
                                        {order.paypal_capture_id}
                                    </p>
                                </div>
                            )}
                            {order.paypal_payer_email && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Payer Email
                                    </span>
                                    <p>{order.paypal_payer_email}</p>
                                </div>
                            )}
                            {order.paypal_payer_id && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Payer ID
                                    </span>
                                    <p className="font-mono text-xs">
                                        {order.paypal_payer_id}
                                    </p>
                                </div>
                            )}
                            {order.amount_paid && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Amount Paid
                                    </span>
                                    <p className="font-medium">
                                        {formatCurrency(order.amount_paid)}
                                    </p>
                                </div>
                            )}
                            {order.paid_at && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Paid At
                                    </span>
                                    <p>
                                        {new Date(
                                            order.paid_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Addresses */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {order.shipping_address && (
                        <div className="rounded-lg border p-4 text-sm">
                            <span className="font-medium">
                                Shipping Address
                            </span>
                            <p className="mt-1 text-muted-foreground">
                                {order.shipping_address}
                            </p>
                        </div>
                    )}
                    {order.billing_address && (
                        <div className="rounded-lg border p-4 text-sm">
                            <span className="font-medium">Billing Address</span>
                            <p className="mt-1 text-muted-foreground">
                                {order.billing_address}
                            </p>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="rounded-lg border p-4 text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        {order.notes}
                    </div>
                )}
            </div>
        </>
    );
}
