import { Head, router, useForm } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { ActiveBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoyaltyAccount = {
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
};

type Props = {
    accounts: {
        data: LoyaltyAccount[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: { url: string | null; label: string; active: boolean }[];
        next_page_url: string | null;
        prev_page_url: string | null;
        first_page_url: string | null;
        last_page_url: string | null;
    };
    filters: Record<string, string>;
    settings: {
        id: string;
        points_per_currency_unit: string;
        currency_value_per_point: string;
        is_active: boolean;
    };
    summary: {
        active_accounts: number;
        points_balance_total: number;
        points_earned_total: number;
        points_redeemed_total: number;
    };
};

export default function LoyaltyIndex({
    accounts,
    filters,
    settings,
    summary,
}: Props) {
    const settingsForm = useForm({
        points_per_currency_unit: settings.points_per_currency_unit,
        currency_value_per_point: settings.currency_value_per_point,
        is_active: settings.is_active,
    });

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/loyalty',
            { search: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const meta: PaginationMeta = {
        current_page: accounts.current_page,
        last_page: accounts.last_page,
        per_page: accounts.per_page,
        total: accounts.total,
        from: accounts.from,
        to: accounts.to,
        links: accounts.links,
    };

    const links: PaginationLinks = {
        first: accounts.first_page_url ?? null,
        last: accounts.last_page_url ?? null,
        prev: accounts.prev_page_url,
        next: accounts.next_page_url,
    };

    const columns: Column<LoyaltyAccount>[] = [
        {
            key: 'customer',
            label: 'Customer',
            render: (a) =>
                a.customer
                    ? `${a.customer.first_name} ${a.customer.last_name}`
                    : '-',
        },
        {
            key: 'email',
            label: 'Email',
            render: (a) => a.customer?.email ?? '-',
        },
        { key: 'points_balance', label: 'Balance' },
        { key: 'total_points_earned', label: 'Earned' },
        { key: 'total_points_redeemed', label: 'Redeemed' },
        {
            key: 'is_active',
            label: 'Status',
            render: (a) => <ActiveBadge active={a.is_active} />,
        },
    ];

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post('/admin/loyalty/settings');
    };

    return (
        <>
            <Head title="Loyalty Accounts" />
            <div className="space-y-6">
                <PageHeader
                    title="Loyalty Accounts"
                    description="View customer loyalty accounts and point balances"
                />

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Active Accounts
                        </p>
                        <p className="text-2xl font-semibold">
                            {summary.active_accounts}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Points In Circulation
                        </p>
                        <p className="text-2xl font-semibold">
                            {summary.points_balance_total.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Lifetime Earned
                        </p>
                        <p className="text-2xl font-semibold text-green-600">
                            {summary.points_earned_total.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Lifetime Redeemed
                        </p>
                        <p className="text-2xl font-semibold text-orange-600">
                            {summary.points_redeemed_total.toFixed(2)}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSettingsSubmit}
                    className="space-y-4 rounded-lg border p-6"
                >
                    <div>
                        <h2 className="text-lg font-medium">
                            Program Settings
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Define how many points customers earn per pound and
                            how much each point is worth at checkout.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="points_per_currency_unit">
                                Points per £1
                            </Label>
                            <Input
                                id="points_per_currency_unit"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    settingsForm.data.points_per_currency_unit
                                }
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'points_per_currency_unit',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency_value_per_point">
                                £ value per point
                            </Label>
                            <Input
                                id="currency_value_per_point"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    settingsForm.data.currency_value_per_point
                                }
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'currency_value_per_point',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <label className="flex items-center gap-2 rounded-lg border px-4 py-3">
                            <input
                                type="checkbox"
                                checked={settingsForm.data.is_active}
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'is_active',
                                        e.target.checked,
                                    )
                                }
                            />
                            <span className="text-sm">Enable loyalty</span>
                        </label>
                    </div>

                    <Button type="submit" disabled={settingsForm.processing}>
                        Save Settings
                    </Button>
                </form>

                <DataTable
                    columns={columns}
                    data={accounts.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by customer name or email..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(a) => `/admin/loyalty/${a.id}`}
                    rowKey={(a) => a.id}
                />
            </div>
        </>
    );
}
