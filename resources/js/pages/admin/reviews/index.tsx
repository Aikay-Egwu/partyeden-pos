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

type Review = {
    id: string;
    name: string;
    email: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    is_featured: boolean;
    show_in_gallery: boolean;
    product?: { id: string; name: string } | null;
    occasion?: { id: string; name: string } | null;
};

type Props = {
    reviews: {
        data: Review[];
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

export default function ReviewsIndex({ reviews, filters }: Props) {
    const meta: PaginationMeta = {
        current_page: reviews.current_page,
        last_page: reviews.last_page,
        per_page: reviews.per_page,
        total: reviews.total,
        from: reviews.from,
        to: reviews.to,
        links: reviews.links,
    };

    const links: PaginationLinks = {
        first: reviews.first_page_url ?? null,
        last: reviews.last_page_url ?? null,
        prev: reviews.prev_page_url,
        next: reviews.next_page_url,
    };

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/reviews',
                { ...filters, search: value },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters],
    );

    const columns: Column<Review>[] = [
        { key: 'name', label: 'Customer' },
        {
            key: 'rating',
            label: 'Rating',
            render: (review) => `${review.rating}/5`,
        },
        {
            key: 'status',
            label: 'Status',
            render: (review) => <Badge>{review.status}</Badge>,
        },
        {
            key: 'is_featured',
            label: 'Featured',
            render: (review) => (review.is_featured ? 'Yes' : 'No'),
        },
        {
            key: 'show_in_gallery',
            label: 'Gallery',
            render: (review) => (review.show_in_gallery ? 'Yes' : 'No'),
        },
        {
            key: 'occasion',
            label: 'Context',
            render: (review) =>
                review.occasion?.name ?? review.product?.name ?? '-',
        },
    ];

    return (
        <>
            <Head title="Reviews" />
            <div className="space-y-6">
                <PageHeader
                    title="Reviews"
                    description="Moderate customer ratings, testimonials, and gallery submissions"
                />
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map(
                        (status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() =>
                                    router.get(
                                        '/admin/reviews',
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
                    data={reviews.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search reviews..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(review) => `/admin/reviews/${review.id}`}
                    rowKey={(review) => review.id}
                />
            </div>
        </>
    );
}
