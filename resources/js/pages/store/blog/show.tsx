import { Head } from '@inertiajs/react';

type Props = {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt?: string | null;
        content: string;
        cover_image?: string | null;
        published_at?: string | null;
        author?: { id: number; name: string } | null;
    };
};

export default function BlogShow({ post }: Props) {
    return (
        <>
            <Head title={post.title} />
            <article className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
                <header className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {post.published_at} •{' '}
                        {post.author?.name ?? 'Party Eden'}
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight">
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p className="text-lg text-muted-foreground">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {post.cover_image && (
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full rounded-3xl object-cover"
                    />
                )}

                <div className="prose max-w-none whitespace-pre-wrap text-foreground">
                    {post.content}
                </div>
            </article>
        </>
    );
}
