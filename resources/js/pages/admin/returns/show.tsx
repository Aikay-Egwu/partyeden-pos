import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

// Returned item shape
type ReturnedItem = {
    id: string;
    quantity: string;
    unit_price: string;
    total: string;
    reason: string | null;
    product?: { id: string; name: string; sku: string } | null;
};

type ReturnRecord = {
    id: string;
    return_number: string;
    status: string;
    reason: string | null;
    total_refund: string;
    notes: string | null;
    created_at: string;
    processed_at: string | null;
    transaction?: { id: string; transaction_number: string } | null;
    customer?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
    staff?: { id: string; first_name: string; last_name: string } | null;
    location?: { id: string; name: string } | null;
    processedBy?: { id: string; name: string } | null;
    items: ReturnedItem[];
};

type Props = {
    return: ReturnRecord;
    statusTransitions: string[];
};

/**
 * Return detail page.
 * Shows return info, items, and processing status.
 */
export default function ReturnShow({ return: r, statusTransitions }: Props) {
    const handleStatusUpdate = (status: string) => {
        if (!confirm(`Change return status to ${status}?`)) {
            return;
        }

        router.patch(
            `/admin/returns/${r.id}/status`,
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={`Return ${r.return_number}`} />
            <div className="space-y-6 p-4">
                {/* Back link */}
                <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link href="/admin/returns">
                        <ArrowLeft className="size-4" />
                        Back to returns
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {r.return_number}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Created {new Date(r.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge value={r.status} />
                        {statusTransitions && statusTransitions.length > 0 && (
                            <div className="mt-2 flex gap-2">
                                {statusTransitions.map((status) => (
                                    <Button
                                        key={status}
                                        onClick={() =>
                                            handleStatusUpdate(status)
                                        }
                                        variant={
                                            status === 'rejected'
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
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-4">
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Transaction
                        </span>
                        <p className="text-sm font-medium">
                            {r.transaction?.transaction_number ?? '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Customer
                        </span>
                        <p className="text-sm font-medium">
                            {r.customer
                                ? `${r.customer.first_name} ${r.customer.last_name}`
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Staff
                        </span>
                        <p className="text-sm font-medium">
                            {r.staff
                                ? `${r.staff.first_name} ${r.staff.last_name}`
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">
                            Location
                        </span>
                        <p className="text-sm font-medium">
                            {r.location?.name ?? '-'}
                        </p>
                    </div>
                </div>

                {/* Reason */}
                {r.reason && (
                    <div className="rounded-lg border p-4 text-sm">
                        <span className="font-medium">Reason: </span>
                        {r.reason}
                    </div>
                )}

                {/* Returned items */}
                <div className="space-y-2">
                    <h2 className="text-lg font-medium">Returned Items</h2>
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
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                        Reason
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {r.items.map((item) => (
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
                                        <td className="px-4 py-2">
                                            {item.reason ?? '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Refund total */}
                <div className="ml-auto max-w-xs space-y-1 rounded-lg border p-4 text-sm">
                    <div className="flex justify-between font-semibold">
                        <span>Total Refund</span>
                        <span className="text-red-600">
                            {formatCurrency(r.total_refund)}
                        </span>
                    </div>
                </div>

                {/* Processing info */}
                {r.processedBy && (
                    <div className="rounded-lg border p-4 text-sm">
                        <span className="text-muted-foreground">
                            Processed by:{' '}
                        </span>
                        <span className="font-medium">
                            {r.processedBy.name}
                        </span>
                        {r.processed_at && (
                            <>
                                <span className="text-muted-foreground">
                                    {' '}
                                    on{' '}
                                </span>
                                <span>
                                    {new Date(r.processed_at).toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* Notes */}
                {r.notes && (
                    <div className="rounded-lg border p-4 text-sm">
                        <span className="text-muted-foreground">Notes: </span>
                        {r.notes}
                    </div>
                )}
            </div>
        </>
    );
}
