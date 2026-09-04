import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    status: 'draft' | 'published';
    cover_image_path?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
} | null;

type Props = {
    blogPost: BlogPost;
};

export default function BlogPostForm({ blogPost }: Props) {
    const isEditing = blogPost !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        title: blogPost?.title ?? '',
        slug: blogPost?.slug ?? '',
        excerpt: blogPost?.excerpt ?? '',
        content: blogPost?.content ?? '',
        status: blogPost?.status ?? 'draft',
        cover_image_path: blogPost?.cover_image_path ?? null,
        cover_image: null as File | null,
        seo_title: blogPost?.seo_title ?? '',
        seo_description: blogPost?.seo_description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (isEditing) {
            put(`/admin/blog-posts/${blogPost.id}`, {
                data: formData,
                forceFormData: true,
            } as never);
        } else {
            post('/admin/blog-posts', {
                data: formData,
                forceFormData: true,
            } as never);
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing ? `Edit ${blogPost.title}` : 'Create Blog Post'
                }
            />
            <FormPage
                title={
                    isEditing ? `Edit ${blogPost.title}` : 'Create Blog Post'
                }
                backUrl="/admin/blog-posts"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                            />
                            <InputError message={errors.slug} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <textarea
                            id="excerpt"
                            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                        />
                        <InputError message={errors.excerpt} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <textarea
                            id="content"
                            className="min-h-80 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                        />
                        <InputError message={errors.content} />
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <ImageUpload
                            previewUrl={
                                blogPost?.cover_image_path
                                    ? `/storage/${blogPost.cover_image_path}`
                                    : null
                            }
                            onFileChange={(file) => {
                                setData('cover_image', file);

                                if (!file) {
                                    setData('cover_image_path', '');
                                }
                            }}
                            maxFileSizeKb={4096}
                        />
                        <InputError message={errors.cover_image} />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) =>
                                setData(
                                    'status',
                                    value as 'draft' | 'published',
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="seo_title">SEO Title</Label>
                            <Input
                                id="seo_title"
                                value={data.seo_title}
                                onChange={(e) =>
                                    setData('seo_title', e.target.value)
                                }
                            />
                            <InputError message={errors.seo_title} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seo_description">
                                SEO Description
                            </Label>
                            <textarea
                                id="seo_description"
                                className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                value={data.seo_description}
                                onChange={(e) =>
                                    setData('seo_description', e.target.value)
                                }
                            />
                            <InputError message={errors.seo_description} />
                        </div>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Blog Post' : 'Create Blog Post'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
