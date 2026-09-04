import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';

type AuditLog = {
    id: string;
    event: string;
    auditable_type: string | null;
    auditable_id: string | null;
    description: string | null;
    ip_address: string | null;
    created_at: string;
    user?: { id: string; name: string } | null;
};

type Props = {
    logs: {
        data: AuditLog[];
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

export default function AuditLogsIndex({ logs, filters }: Props) {
    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/audit-logs',
            { search: value || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const meta: PaginationMeta = {
        current_page: logs.current_page,
        last_page: logs.last_page,
        per_page: logs.per_page,
        total: logs.total,
        from: logs.from,
        to: logs.to,
        links: logs.links,
    };

    const links: PaginationLinks = {
        first: logs.first_page_url ?? null,
        last: logs.last_page_url ?? null,
        prev: logs.prev_page_url,
        next: logs.next_page_url,
    };

    const columns: Column<AuditLog>[] = [
        {
            key: 'event',
            label: 'Event',
            render: (l) => <span className="capitalize">{l.event}</span>,
        },
        {
            key: 'auditable_type',
            label: 'Entity',
            render: (l) => l.auditable_type ?? '-',
        },
        { key: 'user', label: 'User', render: (l) => l.user?.name ?? '-' },
        { key: 'ip_address', label: 'IP', render: (l) => l.ip_address ?? '-' },
        {
            key: 'created_at',
            label: 'Timestamp',
            render: (l) => new Date(l.created_at).toLocaleString(),
        },
    ];

    return (
        <>
            <Head title="Audit Logs" />
            <div className="space-y-6">
                <PageHeader
                    title="Audit Logs"
                    description="System-wide audit trail for compliance and debugging"
                />

                <DataTable
                    columns={columns}
                    data={logs.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by event or entity type..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(l) => `/admin/audit-logs/${l.id}`}
                    rowKey={(l) => l.id}
                />
            </div>
        </>
    );
}
