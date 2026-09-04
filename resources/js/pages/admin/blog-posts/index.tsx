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

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    published_at?: string | null;
    author?: { id: number; name: string } | null;
};

type Props = {
    posts: {
        data: BlogPost[];
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

export default function BlogPostsIndex({ posts, filters }: Props) {
    const deleteDialog = useDeleteDialog<BlogPost>();

    const meta: PaginationMeta = {
        current_page: posts.current_page,
        last_page: posts.last_page,
        per_page: posts.per_page,
        total: posts.total,
        from: posts.from,
        to: posts.to,
        links: posts.links,
    };

    const links: PaginationLinks = {
        first: posts.first_page_url ?? null,
        last: posts.last_page_url ?? null,
        prev: posts.prev_page_url,
        next: posts.next_page_url,
    };

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/blog-posts',
                { ...filters, search: value },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters],
    );

    const columns: Column<BlogPost>[] = [
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
            key: 'status',
            label: 'Status',
            render: (post) => <Badge>{post.status}</Badge>,
        },
        {
            key: 'published_at',
            label: 'Published',
            render: (post) => post.published_at ?? '-',
        },
        {
            key: 'author',
            label: 'Author',
            render: (post) => post.author?.name ?? '-',
        },
    ];

    return (
        <>
            <Head title="Blog Posts" />
            <div className="space-y-6">
                <PageHeader
                    title="Blog Posts"
                    description="Write and publish storefront blog content"
                    createUrl="/admin/blog-posts/create"
                />
                <div className="flex flex-wrap gap-2">
                    {['all', 'draft', 'published'].map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() =>
                                router.get(
                                    '/admin/blog-posts',
                                    {
                                        ...filters,
                                        status: status === 'all' ? '' : status,
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
                    ))}
                </div>
                <DataTable
                    columns={columns}
                    data={posts.data}
                    meta={meta}
                    links={links}
                    searchPlaceholder="Search posts..."
                    searchValue={filters.search ?? ''}
                    onSearchChange={handleSearch}
                    editUrl={(post) => `/admin/blog-posts/${post.id}/edit`}
                    deleteAction={(post) => deleteDialog.openDialog(post)}
                    rowKey={(post) => post.id}
                />
                <DeleteDialog
                    open={deleteDialog.open}
                    onOpenChange={deleteDialog.onOpenChange}
                    deleteUrl={
                        deleteDialog.item
                            ? `/admin/blog-posts/${deleteDialog.item.id}`
                            : ''
                    }
                    itemName={deleteDialog.item?.title}
                    resource="blog post"
                />
            </div>
        </>
    );
}
