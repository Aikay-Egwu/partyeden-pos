import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

type DeliveryZone = {
    id: string;
    name: string;
    delivery_price: string;
    min_order_amount: string | null;
    is_active: boolean;
    prefixes_count: number;
    created_at: string;
};

type Props = {
    zones: {
        data: DeliveryZone[];
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
};

export default function DeliveryZonesIndex({ zones }: Props) {
    const meta: PaginationMeta = {
        current_page: zones.current_page,
        last_page: zones.last_page,
        per_page: zones.per_page,
        total: zones.total,
        from: zones.from,
        to: zones.to,
        links: zones.links,
    };
    const links: PaginationLinks = {
        first: zones.first_page_url ?? null,
        last: zones.last_page_url ?? null,
        prev: zones.prev_page_url,
        next: zones.next_page_url,
    };

    const columns: Column<DeliveryZone>[] = [
        { key: 'name', label: 'Zone Name' },
        {
            key: 'delivery_price',
            label: 'Delivery Price',
            render: (z) => formatCurrency(z.delivery_price),
        },
        {
            key: 'min_order_amount',
            label: 'Min Order',
            render: (z) =>
                z.min_order_amount ? formatCurrency(z.min_order_amount) : '-',
        },
        {
            key: 'prefixes_count',
            label: 'Postcodes',
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (z) => (
                <StatusBadge value={z.is_active ? 'active' : 'inactive'} />
            ),
        },
    ];

    return (
        <>
            <Head title="Delivery Zones" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Delivery Zones"
                        description="Manage local delivery areas and pricing"
                    />
                    <Button asChild>
                        <Link href="/admin/delivery-zones/create">
                            <Plus className="mr-2 size-4" />
                            New Zone
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={zones.data}
                    meta={meta}
                    links={links}
                    editUrl={(z) => `/admin/delivery-zones/${z.id}/edit`}
                    rowKey={(z) => z.id}
                />
            </div>
        </>
    );
}
