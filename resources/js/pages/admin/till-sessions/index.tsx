import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { formatCurrency } from '@/lib/currency';

type TillSession = {
    id: string;
    status: string;
    opened_at: string;
    closed_at: string | null;
    opening_balance: string;
    closing_balance: string | null;
    expected_balance: string | null;
    cash_sales: string;
    notes: string | null;
    staff?: { id: string; first_name: string; last_name: string } | null;
    location?: { id: string; name: string } | null;
    transactions_count: number;
};

type Props = {
    sessions: {
        data: TillSession[];
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
};

export default function TillSessionsIndex({ sessions, filters }: Props) {
    const handleStatusFilter = useCallback((value: string) => {
        router.get(
            '/admin/till-sessions',
            { status: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const meta: PaginationMeta = {
        current_page: sessions.current_page,
        last_page: sessions.last_page,
        per_page: sessions.per_page,
        total: sessions.total,
        from: sessions.from,
        to: sessions.to,
        links: sessions.links,
    };

    const links: PaginationLinks = {
        first: sessions.first_page_url ?? null,
        last: sessions.last_page_url ?? null,
        prev: sessions.prev_page_url,
        next: sessions.next_page_url,
    };

    const columns: Column<TillSession>[] = [
        {
            key: 'staff',
            label: 'Staff',
            render: (s) =>
                s.staff ? `${s.staff.first_name} ${s.staff.last_name}` : '-',
        },
        {
            key: 'location',
            label: 'Location',
            render: (s) => s.location?.name ?? '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (s) => <StatusBadge value={s.status} />,
        },
        {
            key: 'opened_at',
            label: 'Opened',
            render: (s) => new Date(s.opened_at).toLocaleString(),
        },
        {
            key: 'opening_balance',
            label: 'Opening',
            render: (s) => formatCurrency(s.opening_balance),
        },
        {
            key: 'cash_sales',
            label: 'Cash Sales',
            render: (s) => formatCurrency(s.cash_sales),
        },
        {
            key: 'expected_balance',
            label: 'Expected',
            render: (s) =>
                s.expected_balance ? formatCurrency(s.expected_balance) : '-',
        },
        { key: 'transactions_count', label: 'Txns' },
    ];

    return (
        <>
            <Head title="Till Sessions" />
            <div className="space-y-6">
                <PageHeader
                    title="Till Sessions"
                    description="View till session history"
                />

                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={sessions.data}
                    meta={meta}
                    links={links}
                    rowKey={(s) => s.id}
                />
            </div>
        </>
    );
}
