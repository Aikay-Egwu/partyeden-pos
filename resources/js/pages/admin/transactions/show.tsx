import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

// Transaction detail shape
type TransactionItem = {
    id: string;
    quantity: string;
    unit_price: string;
    total: string;
    product?: { id: string; name: string; sku: string } | null;
};

type Payment = {
    id: string;
    method: string;
    amount: string;
    reference: string | null;
};

type Transaction = {
    id: string;
    transaction_number: string;
    status: string;
    subtotal: string;
    tax_amount: string;
    discount_amount: string;
    total: string;
    notes: string | null;
    created_at: string;
    staff?: { id: string; first_name: string; last_name: string } | null;
    customer?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
    location?: { id: string; name: string } | null;
    items: TransactionItem[];
    payments: Payment[];
    discount?: { id: string; name: string; code: string } | null;
};

type Props = {
    transaction: Transaction;
};

/**
 * Transaction detail page (read-only).
 * Shows items, payments, and summary info.
 */
export default function TransactionShow({ transaction: t }: Props) {
    return (
        <>
            <Head title={`Transaction ${t.transaction_number}`} />
            <div className="space-y-6 p-4">
                {/* Back link */}
                <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link href="/admin/transactions">
                        <ArrowLeft className="size-4" />
                        Back to transactions
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t.transaction_number}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {new Date(t.created_at).toLocaleString()}
                        </p>
                    </div>
                    <StatusBadge value={t.status} />
                </div>

                {/* Info grid */}
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Staff
                        </span>
                        <p className="text-sm font-medium">
                            {t.staff
                                ? `${t.staff.first_name} ${t.staff.last_name}`
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Customer
                        </span>
                        <p className="text-sm font-medium">
                            {t.customer
                                ? `${t.customer.first_name} ${t.customer.last_name}`
                                : 'Walk-in'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Location
                        </span>
                        <p className="text-sm font-medium">
                            {t.location?.name ?? '-'}
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
                                {t.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-2">
                                            {item.product?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {formatCurrency(item.unit_price)}
                                        </td>
                                        <td className="px-4 py-2 text-right">
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
                        <span>{formatCurrency(t.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(t.tax_amount)}</span>
                    </div>
                    {Number(t.discount_amount) > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(t.discount_amount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t pt-1 font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(t.total)}</span>
                    </div>
                </div>

                {/* Payments */}
                {t.payments.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-medium">Payments</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Method
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                            Amount
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Reference
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {t.payments.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-2 capitalize">
                                                {p.method}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {formatCurrency(p.amount)}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.reference ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Discount applied */}
                {t.discount && (
                    <div className="rounded-lg border p-4 text-sm">
                        <span className="text-muted-foreground">
                            Discount applied:{' '}
                        </span>
                        <Badge variant="outline">{t.discount.code}</Badge>
                        <span className="ml-1">{t.discount.name}</span>
                    </div>
                )}

                {/* Notes */}
                {t.notes && (
                    <div className="rounded-lg border p-4 text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        {t.notes}
                    </div>
                )}
            </div>
        </>
    );
}
