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

type ReturnItem = {
    id: string;
    return_number: string;
    status: string;
    reason: string | null;
    total_refund: string;
    created_at: string;
    transaction?: { id: string; transaction_number: string } | null;
    customer?: { id: string; first_name: string; last_name: string } | null;
    staff?: { id: string; first_name: string; last_name: string } | null;
    location?: { id: string; name: string } | null;
};

type Props = {
    returns: {
        data: ReturnItem[];
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

export default function ReturnsIndex({ returns, filters }: Props) {
    const handleStatusFilter = useCallback((value: string) => {
        router.get(
            '/admin/returns',
            { status: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const meta: PaginationMeta = {
        current_page: returns.current_page,
        last_page: returns.last_page,
        per_page: returns.per_page,
        total: returns.total,
        from: returns.from,
        to: returns.to,
        links: returns.links,
    };

    const links: PaginationLinks = {
        first: returns.first_page_url ?? null,
        last: returns.last_page_url ?? null,
        prev: returns.prev_page_url,
        next: returns.next_page_url,
    };

    const columns: Column<ReturnItem>[] = [
        { key: 'return_number', label: 'Return #' },
        {
            key: 'transaction',
            label: 'Transaction',
            render: (r) => r.transaction?.transaction_number ?? '-',
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (r) =>
                r.customer
                    ? `${r.customer.first_name} ${r.customer.last_name}`
                    : '-',
        },
        {
            key: 'staff',
            label: 'Staff',
            render: (r) =>
                r.staff ? `${r.staff.first_name} ${r.staff.last_name}` : '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (r) => <StatusBadge value={r.status} />,
        },
        {
            key: 'total_refund',
            label: 'Refund',
            render: (r) => formatCurrency(r.total_refund),
        },
        { key: 'created_at', label: 'Date' },
    ];

    return (
        <>
            <Head title="Returns" />
            <div className="space-y-6">
                <PageHeader
                    title="Returns"
                    description="View and manage product returns"
                />

                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={returns.data}
                    meta={meta}
                    links={links}
                    editUrl={(r) => `/admin/returns/${r.id}`}
                    rowKey={(r) => r.id}
                />
            </div>
        </>
    );
}
