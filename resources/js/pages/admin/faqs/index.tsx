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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Faq = {
    id: string;
    question: string;
    answer: string;
    category: 'winter' | 'summer' | 'general';
    sort_order: number;
    is_visible: boolean;
};

type Props = {
    faqs: {
        data: Faq[];
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
    filters: {
        search?: string;
        category?: string;
        visibility?: string;
    };
};

export default function FaqsIndex({ faqs, filters }: Props) {
    const deleteDialog = useDeleteDialog<Faq>();

    const meta: PaginationMeta = {
        current_page: faqs.current_page,
        last_page: faqs.last_page,
        per_page: faqs.per_page,
        total: faqs.total,
        from: faqs.from,
        to: faqs.to,
        links: faqs.links,
    };

    const links: PaginationLinks = {
        first: faqs.first_page_url,
        last: faqs.last_page_url,
        prev: faqs.prev_page_url,
        next: faqs.next_page_url,
    };

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/faqs',
                { ...filters, search: value },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters],
    );

    const setFilter = (key: 'category' | 'visibility', value: string) => {
        router.get(
            '/admin/faqs',
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true },
        );
    };

    const columns: Column<Faq>[] = [
        { key: 'question', label: 'Question' },
        {
            key: 'category',
            label: 'Season',
            render: (faq) => (
                <Badge variant="secondary" className="capitalize">
                    {faq.category}
                </Badge>
            ),
        },
        {
            key: 'sort_order',
            label: 'Order',
        },
        {
            key: 'is_visible',
            label: 'Visibility',
            render: (faq) => (
                <Badge variant={faq.is_visible ? 'default' : 'outline'}>
                    {faq.is_visible ? 'Visible' : 'Hidden'}
                </Badge>
            ),
        },
    ];

    return (
        <>
            <Head title="FAQs" />
            <div className="space-y-6">
                <PageHeader
                    title="FAQs"
                    description="Manage the balloon care answers shown to customers"
                    createUrl="/admin/faqs/create"
                    createLabel="Add FAQ"
                />
                <div className="flex flex-wrap gap-2">
                    <div
                        className="flex flex-wrap gap-2"
                        aria-label="FAQ season filter"
                    >
                        {['all', 'winter', 'summer', 'general'].map(
                            (category) => (
                                <button
                                    key={category}
                                    type="button"
                                    aria-pressed={
                                        (filters.category ?? '') ===
                                        (category === 'all' ? '' : category)
                                    }
                                    onClick={() =>
                                        setFilter(
                                            'category',
                                            category === 'all' ? '' : category,
                                        )
                                    }
                                    className={`rounded-full border px-3 py-1 text-sm capitalize ${
                                        (filters.category ?? '') ===
                                        (category === 'all' ? '' : category)
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border'
                                    }`}
                                >
                                    {category}
                                </button>
                            ),
                        )}
                    </div>
                    <div
                        className="flex flex-wrap gap-2"
                        aria-label="FAQ visibility filter"
                    >
                        {[
                            { label: 'Any visibility', value: '' },
                            { label: 'Visible', value: 'visible' },
                            { label: 'Hidden', value: 'hidden' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={
                                    (filters.visibility ?? '') === option.value
                                }
                                onClick={() =>
                                    setFilter('visibility', option.value)
                                }
                                className={`rounded-full border px-3 py-1 text-sm ${
                                    (filters.visibility ?? '') === option.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={faqs.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search questions and answers..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(faq) => `/admin/faqs/${faq.id}/edit`}
                    deleteAction={(faq) => deleteDialog.openDialog(faq)}
                    customActions={(faq) => (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.patch(
                                    `/admin/faqs/${faq.id}/visibility`,
                                    { is_visible: !faq.is_visible },
                                    { preserveScroll: true },
                                )
                            }
                        >
                            {faq.is_visible ? 'Hide' : 'Show'}
                        </Button>
                    )}
                    rowKey={(faq) => faq.id}
                    emptyMessage="No FAQs match these filters."
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/faqs/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.question}
                    resource="FAQ"
                />
            </div>
        </>
    );
}
