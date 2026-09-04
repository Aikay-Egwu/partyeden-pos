import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

type Category = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    image_path?: string | null;
    parent?: { id: string; name: string } | null;
} | null;

type Props = {
    category: Category;
    parents: { id: string; name: string }[];
};

export default function CategoryForm({ category, parents }: Props) {
    const isEditing = category !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        parent_id: category?.parent?.id ?? '',
        sort_order: String(category?.sort_order ?? 0),
        is_active: category?.is_active ?? true,
        image_path: category?.image_path ?? null,
        image: null as File | null,
    });

    const imagePreviewUrl = category?.image_path
        ? `/storage/${category.image_path}`
        : null;

    const handleImageChange = (file: File | null) => {
        setData('image', file);

        if (!file) {
            // Send empty string so the server knows to clear the image.
            setData('image_path', '');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Attach the raw File object to the form data so Inertia sends it as multipart.
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, value);
                }
            }
        });

        if (isEditing) {
            put(`/admin/categories/${category!.id}`, {
                data: formData,
                forceFormData: true,
            } as any);
        } else {
            post('/admin/categories', {
                data: formData,
                forceFormData: true,
            } as any);
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${category.name}` : 'Create Category'}
            />
            <FormPage
                title={isEditing ? `Edit ${category.name}` : 'Create Category'}
                backUrl="/admin/categories"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            <InputError message={errors.name} />
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
                        <Label>Parent Category</Label>
                        <Select
                            value={data.parent_id}
                            onValueChange={(v) => setData('parent_id', v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="None (root category)" />
                            </SelectTrigger>
                            <SelectContent>
                                {parents.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            title="Description"
                            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Image</Label>
                        <ImageUpload
                            previewUrl={imagePreviewUrl}
                            onFileChange={handleImageChange}
                            maxFileSizeKb={2048}
                        />
                        <InputError message={errors.image_path} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData('sort_order', e.target.value)
                                }
                            />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', !!v)
                                    }
                                />
                                <span className="text-sm">Active</span>
                            </label>
                        </div>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Category' : 'Create Category'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
