import { Head, Link } from '@inertiajs/react';
import { SectionWrapper } from '@/components/store/section-wrapper';

type Post = {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    cover_image?: string | null;
    published_at?: string | null;
    author?: { id: number; name: string } | null;
};

type Props = {
    posts: {
        data: Post[];
    };
};

export default function BlogIndex({ posts }: Props) {
    return (
        <>
            <Head title="Blog" />
            <SectionWrapper
                title="Blog"
                subtitle="Tips, inspiration, and event ideas from Party Eden"
            >
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {posts.data.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
                        >
                            {post.cover_image && (
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="aspect-[16/10] w-full object-cover"
                                />
                            )}
                            <div className="space-y-3 p-5">
                                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                    {post.published_at}
                                </p>
                                <h2 className="text-xl font-semibold">
                                    {post.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {post.excerpt}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {post.author?.name ?? 'Party Eden'}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </SectionWrapper>
        </>
    );
}
