import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/currency';

// Loyalty transaction shape
type LoyaltyTransaction = {
    id: string;
    type: string;
    points: string;
    description: string | null;
    created_at: string;
};

type Account = {
    id: string;
    points_balance: string;
    total_points_earned: string;
    total_points_redeemed: string;
    is_active: boolean;
    created_at: string;
    customer?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
    } | null;
    transactions: LoyaltyTransaction[];
};

type Props = {
    account: Account;
    settings: {
        points_per_currency_unit: string;
        currency_value_per_point: string;
        is_active: boolean;
    };
};

/**
 * Loyalty account detail page.
 * Shows customer info, point summary, and recent transactions.
 */
export default function LoyaltyShow({ account, settings }: Props) {
    const adjustmentForm = useForm({
        points: '',
        reason: '',
    });

    const handleAdjustmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adjustmentForm.post(`/admin/loyalty/${account.id}/adjust`, {
            onSuccess: () => adjustmentForm.reset(),
        });
    };

    return (
        <>
            <Head title="Loyalty Account Detail" />
            <div className="space-y-6 p-4">
                {/* Back link */}
                <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link href="/admin/loyalty">
                        <ArrowLeft className="size-4" />
                        Back to loyalty accounts
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {account.customer
                            ? `${account.customer.first_name} ${account.customer.last_name}`
                            : 'Unknown Customer'}
                    </h1>
                    <StatusBadge
                        value={account.is_active ? 'active' : 'inactive'}
                    />
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border p-4">
                        <span className="text-xs text-muted-foreground">
                            Current Balance
                        </span>
                        <p className="text-xl font-semibold">
                            {account.points_balance} pts
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <span className="text-xs text-muted-foreground">
                            Total Earned
                        </span>
                        <p className="text-xl font-semibold text-green-600">
                            {account.total_points_earned}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <span className="text-xs text-muted-foreground">
                            Total Redeemed
                        </span>
                        <p className="text-xl font-semibold text-orange-600">
                            {account.total_points_redeemed}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <span className="text-xs text-muted-foreground">
                            Member Since
                        </span>
                        <p className="text-sm font-medium">
                            {new Date(account.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Customer email */}
                {account.customer?.email && (
                    <p className="text-sm text-muted-foreground">
                        Email: {account.customer.email}
                    </p>
                )}

                <div className="rounded-lg border p-4">
                    <h2 className="text-lg font-medium">Program Settings</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Earn rate: {settings.points_per_currency_unit} points
                        per £1
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Redemption value:{' '}
                        {formatCurrency(settings.currency_value_per_point)} per
                        point
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Status: {settings.is_active ? 'Active' : 'Inactive'}
                    </p>
                </div>

                <form
                    onSubmit={handleAdjustmentSubmit}
                    className="space-y-4 rounded-lg border p-4"
                >
                    <div>
                        <h2 className="text-lg font-medium">
                            Manual Adjustment
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Use a positive value to credit points or a negative
                            value to debit points.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="points">Points</Label>
                            <Input
                                id="points"
                                type="number"
                                step="0.01"
                                value={adjustmentForm.data.points}
                                onChange={(e) =>
                                    adjustmentForm.setData(
                                        'points',
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. 25 or -10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Input
                                id="reason"
                                value={adjustmentForm.data.reason}
                                onChange={(e) =>
                                    adjustmentForm.setData(
                                        'reason',
                                        e.target.value,
                                    )
                                }
                                placeholder="Explain the adjustment"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={adjustmentForm.processing}>
                        Save Adjustment
                    </Button>
                </form>

                {/* Transaction history */}
                <div className="space-y-2">
                    <h2 className="text-lg font-medium">Recent Transactions</h2>
                    {account.transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No loyalty transactions yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Type
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                            Points
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {account.transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-2">
                                                {new Date(
                                                    tx.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 capitalize">
                                                {tx.type}
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-right font-medium ${Number(tx.points) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {Number(tx.points) >= 0
                                                    ? '+'
                                                    : ''}
                                                {tx.points}
                                            </td>
                                            <td className="px-4 py-2">
                                                {tx.description ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
