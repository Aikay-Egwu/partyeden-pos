import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProductOption = {
    id: string;
    name: string;
    sku: string;
};

type Occasion = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    hero_title?: string | null;
    hero_text?: string | null;
    sort_order: number;
    is_active: boolean;
    image_path?: string | null;
    products?: ProductOption[];
} | null;

type Props = {
    occasion: Occasion;
    products: ProductOption[];
};

export default function OccasionForm({ occasion, products }: Props) {
    const isEditing = occasion !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        name: occasion?.name ?? '',
        slug: occasion?.slug ?? '',
        description: occasion?.description ?? '',
        hero_title: occasion?.hero_title ?? '',
        hero_text: occasion?.hero_text ?? '',
        sort_order: String(occasion?.sort_order ?? 0),
        is_active: occasion?.is_active ?? true,
        image_path: occasion?.image_path ?? null,
        image: null as File | null,
        product_ids: occasion?.products?.map((product) => product.id) ?? [],
    });

    const imagePreviewUrl = occasion?.image_path
        ? `/storage/${occasion.image_path}`
        : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((entry) => formData.append(`${key}[]`, entry));

                return;
            }

            if (value !== null && value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, value);
                }
            }
        });

        if (isEditing) {
            put(`/admin/occasions/${occasion.id}`, {
                data: formData,
                forceFormData: true,
            } as never);
        } else {
            post('/admin/occasions', {
                data: formData,
                forceFormData: true,
            } as never);
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${occasion.name}` : 'Create Occasion'}
            />
            <FormPage
                title={isEditing ? `Edit ${occasion.name}` : 'Create Occasion'}
                backUrl="/admin/occasions"
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
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="hero_title">Hero Title</Label>
                            <Input
                                id="hero_title"
                                value={data.hero_title}
                                onChange={(e) =>
                                    setData('hero_title', e.target.value)
                                }
                            />
                            <InputError message={errors.hero_title} />
                        </div>
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
                            <InputError message={errors.sort_order} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hero_text">Hero Text</Label>
                        <textarea
                            id="hero_text"
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.hero_text}
                            onChange={(e) =>
                                setData('hero_text', e.target.value)
                            }
                        />
                        <InputError message={errors.hero_text} />
                    </div>

                    <div className="space-y-2">
                        <Label>Occasion Image</Label>
                        <ImageUpload
                            previewUrl={imagePreviewUrl}
                            onFileChange={(file) => {
                                setData('image', file);

                                if (!file) {
                                    setData('image_path', '');
                                }
                            }}
                            maxFileSizeKb={2048}
                        />
                        <InputError message={errors.image} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product_ids">Linked Products</Label>
                        <select
                            id="product_ids"
                            multiple
                            value={data.product_ids}
                            onChange={(e) =>
                                setData(
                                    'product_ids',
                                    Array.from(
                                        e.target.selectedOptions,
                                        (option) => option.value,
                                    ),
                                )
                            }
                            className="min-h-56 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                        >
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            The order you select here becomes the storefront
                            order for this occasion.
                        </p>
                        <InputError message={errors.product_ids} />
                    </div>

                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(value) =>
                                setData('is_active', !!value)
                            }
                        />
                        <span className="text-sm">Active</span>
                    </label>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Occasion' : 'Create Occasion'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
