import { Head } from '@inertiajs/react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';

type Reservation = {
    id: string;
    quantity: string;
    status: string;
    expires_at: string;
    product: { name: string; sku: string };
    location: { name: string };
};
type Props = {
    reservations: {
        data: Reservation[];
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

export default function StockReservationsIndex({ reservations }: Props) {
    const meta: PaginationMeta = {
        current_page: reservations.current_page,
        last_page: reservations.last_page,
        per_page: reservations.per_page,
        total: reservations.total,
        from: reservations.from,
        to: reservations.to,
        links: reservations.links,
    };

    const links: PaginationLinks = {
        first: reservations.first_page_url ?? null,
        last: reservations.last_page_url ?? null,
        prev: reservations.prev_page_url,
        next: reservations.next_page_url,
    };

    const columns: Column<Reservation>[] = [
        { key: 'product', label: 'Product', render: (r) => r.product.name },
        { key: 'location', label: 'Location', render: (r) => r.location.name },
        { key: 'quantity', label: 'Qty' },
        {
            key: 'status',
            label: 'Status',
            render: (r) => <StatusBadge value={r.status} />,
        },
        {
            key: 'expires_at',
            label: 'Expires',
            render: (r) =>
                r.expires_at
                    ? new Date(r.expires_at).toLocaleDateString()
                    : '-',
        },
    ];

    return (
        <>
            <Head title="Stock Reservations" />
            <div className="space-y-6">
                <PageHeader
                    title="Stock Reservations"
                    description="Reserved stock for orders"
                    createUrl="/admin/stock-reservations/create"
                />
                <DataTable
                    columns={columns}
                    data={reservations.data}
                    meta={meta}
                    links={links}
                    rowKey={(r) => r.id}
                    editUrl={(r) => `/admin/stock-reservations/${r.id}/edit`}
                />
            </div>
        </>
    );
}
