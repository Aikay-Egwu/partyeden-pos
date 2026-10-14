import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type {
    Column,
    PaginationLinks,
    PaginationMeta,
} from '@/components/admin/data-table';
import { DataTable } from '@/components/admin/data-table';
import {
    DeleteDialog,
    useDeleteDialog,
} from '@/components/admin/delete-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { ActiveBadge } from '@/components/admin/status-badge';

type User = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    created_at: string | null;
};

type Props = {
    users: {
        data: User[];
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

export default function UsersIndex({ users, filters }: Props) {
    const deleteDialog = useDeleteDialog<User>();

    const meta: PaginationMeta = {
        current_page: users.current_page,
        last_page: users.last_page,
        per_page: users.per_page,
        total: users.total,
        from: users.from,
        to: users.to,
        links: users.links,
    };
    const links: PaginationLinks = {
        first: users.first_page_url ?? null,
        last: users.last_page_url ?? null,
        prev: users.prev_page_url,
        next: users.next_page_url,
    };

    const handleSearch = useCallback((value: string) => {
        router.get(
            '/admin/users',
            { search: value },
            { preserveState: true, preserveScroll: true },
        );
    }, []);

    const columns: Column<User>[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        {
            key: 'is_admin',
            label: 'Administrator',
            render: (u) => <ActiveBadge active={u.is_admin} />,
        },
        {
            key: 'created_at',
            label: 'Created',
            render: (u) =>
                u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : '—',
        },
    ];

    return (
        <>
            <Head title="Administrators" />
            <div className="space-y-6">
                <PageHeader
                    title="Administrators"
                    description="Manage user accounts and administrator access"
                    createUrl="/admin/users/create"
                    createLabel="Add User"
                />
                <DataTable
                    columns={columns}
                    data={users.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search users..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(u) => `/admin/users/${u.id}/edit`}
                    deleteAction={(u) => deleteDialog.openDialog(u)}
                    rowKey={(u) => String(u.id)}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/users/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.name}
                    resource="user"
                />
            </div>
        </>
    );
}
