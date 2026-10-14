import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';

type Message = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    event_type: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    created_at: string;
};

type Props = {
    messages: {
        data: Message[];
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
    unreadCount: number;
};

const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-gray-50 text-gray-500',
};

export default function MessagesIndex({
    messages,
    filters,
    unreadCount,
}: Props) {
    const meta: PaginationMeta = {
        current_page: messages.current_page,
        last_page: messages.last_page,
        per_page: messages.per_page,
        total: messages.total,
        from: messages.from,
        to: messages.to,
        links: messages.links,
    };

    const links: PaginationLinks = {
        first: messages.first_page_url ?? null,
        last: messages.last_page_url ?? null,
        prev: messages.prev_page_url,
        next: messages.next_page_url,
    };

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/messages',
                { ...filters, search: value },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters],
    );

    const columns: Column<Message>[] = [
        {
            key: 'first_name',
            label: 'From',
            render: (msg) => (
                <span className={msg.status === 'new' ? 'font-semibold' : ''}>
                    {msg.first_name} {msg.last_name}
                </span>
            ),
        },
        { key: 'email', label: 'Email' },
        { key: 'event_type', label: 'Event Type' },
        {
            key: 'status',
            label: 'Status',
            render: (msg) => (
                <Badge className={statusColors[msg.status] ?? ''}>
                    {msg.status}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Received',
            render: (msg) =>
                new Date(msg.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }),
        },
    ];

    return (
        <>
            <Head title="Messages" />
            <div className="space-y-6">
                <PageHeader
                    title={`Messages${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
                    description="View and manage contact form messages"
                />
                <div className="flex flex-wrap gap-2">
                    {['all', 'new', 'read', 'replied', 'archived'].map(
                        (status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() =>
                                    router.get(
                                        '/admin/messages',
                                        {
                                            ...filters,
                                            status:
                                                status === 'all' ? '' : status,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    )
                                }
                                className={`rounded-full border px-3 py-1 text-sm ${
                                    (filters.status ?? '') ===
                                    (status === 'all' ? '' : status)
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border'
                                }`}
                            >
                                {status}
                            </button>
                        ),
                    )}
                </div>
                <DataTable
                    columns={columns}
                    data={messages.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search messages..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(msg) => `/admin/messages/${msg.id}`}
                    rowKey={(msg) => msg.id}
                />
            </div>
        </>
    );
}
