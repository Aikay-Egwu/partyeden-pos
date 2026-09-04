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
import { StatusBadge } from '@/components/admin/status-badge';

type StaffMember = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    employee_code: string | null;
    role: string;
    hire_date: string | null;
    is_active: boolean;
    user?: { id: string; name: string } | null;
};

type Props = {
    staff: {
        data: StaffMember[];
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

export default function StaffIndex({ staff, filters }: Props) {
    const deleteDialog = useDeleteDialog<StaffMember>();

    const handleFilter = useCallback(
        (key: string, value: string) => {
            router.get(
                '/admin/staff',
                { ...filters, [key]: value || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters],
    );

    const meta: PaginationMeta = {
        current_page: staff.current_page,
        last_page: staff.last_page,
        per_page: staff.per_page,
        total: staff.total,
        from: staff.from,
        to: staff.to,
        links: staff.links,
    };

    const links: PaginationLinks = {
        first: staff.first_page_url ?? null,
        last: staff.last_page_url ?? null,
        prev: staff.prev_page_url,
        next: staff.next_page_url,
    };

    const columns: Column<StaffMember>[] = [
        {
            key: 'name',
            label: 'Name',
            render: (s) => `${s.first_name} ${s.last_name}`,
        },
        {
            key: 'employee_code',
            label: 'Code',
            render: (s) => s.employee_code ?? '-',
        },
        { key: 'email', label: 'Email', render: (s) => s.email ?? '-' },
        {
            key: 'role',
            label: 'Role',
            render: (s) => <StatusBadge value={s.role} />,
        },
        { key: 'phone', label: 'Phone', render: (s) => s.phone ?? '-' },
        {
            key: 'is_active',
            label: 'Status',
            render: (s) => <ActiveBadge active={s.is_active} />,
        },
    ];

    return (
        <>
            <Head title="Staff" />
            <div className="space-y-6">
                <PageHeader
                    title="Staff"
                    description="Manage your staff members"
                    createUrl="/admin/staff/create"
                />

                <div className="flex gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={filters.role ?? ''}
                        onChange={(e) => handleFilter('role', e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="cashier">Cashier</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={staff.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search by name, email, or employee code..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={(v) => handleFilter('search', v)}
                    editUrl={(s) => `/admin/staff/${s.id}/edit`}
                    deleteAction={(s) => deleteDialog.openDialog(s)}
                    rowKey={(s) => s.id}
                />

                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/staff/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={
                        deleteDialog.item
                            ? `${deleteDialog.item.first_name} ${deleteDialog.item.last_name}`
                            : undefined
                    }
                    resource="staff member"
                />
            </div>
        </>
    );
}
