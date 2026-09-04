import { Head, Link } from '@inertiajs/react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';

type Balance = {
    id: string;
    quantity: string;
    reserved_quantity: string;
    product: { id: string; name: string; sku: string };
    location: { id: string; name: string };
};
type Props = {
    balances: {
        data: Balance[];
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
    products: { id: string; name: string; sku: string }[];
    locations: { id: string; name: string }[];
    filters: Record<string, string>;
};

export default function InventoryIndex({ balances }: Props) {
    const meta: PaginationMeta = {
        current_page: balances.current_page,
        last_page: balances.last_page,
        per_page: balances.per_page,
        total: balances.total,
        from: balances.from,
        to: balances.to,
        links: balances.links,
    };

    const links: PaginationLinks = {
        first: balances.first_page_url ?? null,
        last: balances.last_page_url ?? null,
        prev: balances.prev_page_url,
        next: balances.next_page_url,
    };

    const columns: Column<Balance>[] = [
        {
            key: 'product',
            label: 'Product',
            render: (b) => `${b.product.name} (${b.product.sku})`,
        },
        { key: 'location', label: 'Location', render: (b) => b.location.name },
        { key: 'quantity', label: 'Qty', render: (b) => b.quantity },
        { key: 'reserved_quantity', label: 'Reserved' },
        {
            key: 'actions',
            label: '',
            render: (b) => (
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/inventory/${b.id}/adjust`}>Adjust</Link>
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title="Inventory" />
            <div className="space-y-6">
                <PageHeader
                    title="Stock Levels"
                    description="Inventory balances per product and location"
                />
                <DataTable
                    columns={columns}
                    data={balances.data}
                    meta={meta}
                    links={links}
                    rowKey={(b) => b.id}
                />
            </div>
        </>
    );
}
