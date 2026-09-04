import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';

type Component = {
    id: string;
    name: string;
    sku: string;
    cost_price: string;
    selling_price: string;
    is_active: boolean;
};

type Props = {
    components: {
        data: Component[];
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

export default function ComponentIndex({ components, filters }: Props) {
    const meta: PaginationMeta = {
        current_page: components.current_page,
        last_page: components.last_page,
        per_page: components.per_page,
        total: components.total,
        from: components.from,
        to: components.to,
        links: components.links,
    };
    const links: PaginationLinks = {
        first: components.first_page_url ?? null,
        last: components.last_page_url ?? null,
        prev: components.prev_page_url,
        next: components.next_page_url,
    };

    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                '/admin/components',
                { ...filters, [key]: value || undefined },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters],
    );

    return (
        <>
            <Head title="Components" />
            <PageHeader
                title="Components"
                description="Manage kit components"
                createUrl="/admin/components/create"
                createLabel="Add Component"
            />

            <div className="mb-6 flex flex-wrap gap-4">
                <Input
                    placeholder="Search components..."
                    value={filters.search ?? ''}
                    onChange={(e) => handleFilter('search', e.target.value)}
                    className="max-w-xs"
                />
                <Select
                    value={filters.is_active ?? 'all'}
                    onValueChange={(v) =>
                        handleFilter('is_active', v === 'all' ? '' : v)
                    }
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                columns={[
                    { label: 'Name', key: 'name' },
                    { label: 'SKU', key: 'sku' },
                    {
                        label: 'Cost Price',
                        key: 'cost_price',
                        render: (item) => formatCurrency(item.cost_price),
                    },
                    {
                        label: 'Selling Price',
                        key: 'selling_price',
                        render: (item) => formatCurrency(item.selling_price),
                    },
                    {
                        label: 'Status',
                        key: 'is_active',
                        render: (item) => (
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    item.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                        ),
                    },
                ]}
                rowKey={(item) => item.id}
                data={components.data}
                meta={meta}
                links={links}
                editUrl={(item) => `/admin/components/${item.id}/edit`}
                deleteAction={(item) => {
                    if (
                        confirm(
                            'Are you sure you want to delete this component?',
                        )
                    ) {
                        router.delete(`/admin/components/${item.id}`);
                    }
                }}
            />
        </>
    );
}
