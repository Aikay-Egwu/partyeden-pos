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

// Shape of a transaction record
type Transaction = {
    id: string;
    transaction_number: string;
    status: string;
    subtotal: string;
    tax_amount: string;
    discount_amount: string;
    total: string;
    created_at: string;
    staff?: { id: string; first_name: string; last_name: string } | null;
    customer?: { id: string; first_name: string; last_name: string } | null;
    location?: { id: string; name: string } | null;
};

type Props = {
    transactions: {
        data: Transaction[];
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

/**
 * Transactions list page (read-only).
 * Transactions are created via POS, admin just views them.
 */
export default function TransactionsIndex({ transactions, filters }: Props) {
    const meta: PaginationMeta = {
        current_page: transactions.current_page,
        last_page: transactions.last_page,
        per_page: transactions.per_page,
        total: transactions.total,
        from: transactions.from,
        to: transactions.to,
        links: transactions.links,
    };
    const links: PaginationLinks = {
        first: transactions.first_page_url ?? null,
        last: transactions.last_page_url ?? null,
        prev: transactions.prev_page_url,
        next: transactions.next_page_url,
    };

    // Handle filter changes
    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                '/admin/transactions',
                { ...filters, [key]: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    // Table column definitions
    const columns: Column<Transaction>[] = [
        { key: 'transaction_number', label: 'Transaction #' },
        {
            key: 'staff',
            label: 'Staff',
            render: (t) =>
                t.staff ? `${t.staff.first_name} ${t.staff.last_name}` : '-',
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (t) =>
                t.customer
                    ? `${t.customer.first_name} ${t.customer.last_name}`
                    : '-',
        },
        {
            key: 'location',
            label: 'Location',
            render: (t) => t.location?.name ?? '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (t) => <StatusBadge value={t.status} />,
        },
        {
            key: 'total',
            label: 'Total',
            render: (t) => formatCurrency(t.total),
        },
        { key: 'created_at', label: 'Date' },
    ];

    return (
        <>
            <Head title="Transactions" />
            <div className="space-y-6">
                <PageHeader
                    title="Transactions"
                    description="View all POS transactions"
                />

                {/* Filter row */}
                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="voided">Voided</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <Input
                        type="date"
                        placeholder="From date"
                        value={filters.date_from ?? ''}
                        onChange={(e) =>
                            handleFilter('date_from', e.target.value)
                        }
                        className="h-9 w-auto"
                    />
                    <Input
                        type="date"
                        placeholder="To date"
                        value={filters.date_to ?? ''}
                        onChange={(e) =>
                            handleFilter('date_to', e.target.value)
                        }
                        className="h-9 w-auto"
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={transactions.data}
                    meta={meta}
                    links={links}
                    editUrl={(t) => `/admin/transactions/${t.id}`}
                    rowKey={(t) => t.id}
                />
            </div>
        </>
    );
}

// Minimal Input for date filters
function Input({
    type,
    placeholder,
    value,
    onChange,
    className,
}: {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`rounded-md border border-input bg-transparent px-3 text-sm ${className ?? ''}`}
        />
    );
}
