import { useForm, router } from '@inertiajs/react';
import { Trash2, Star, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminProduct, ProductImage } from '@/types/admin-product';

type BindingType = 'default' | 'variant' | 'primary_color' | 'addon';

// Editable per-image state for the bound image cards
type ImageEditState = {
    binding_type: BindingType;
    variant_id: string;
    primary_color_id: string;
    addon_product_id: string;
    alt_text: string;
    sort_order: string;
};

const DEFAULT_BINDING_TARGET = '__none__';

export function ImagesPanel({ product }: { product: AdminProduct }) {
    const {
        data,
        setData,
        post,
        processing,
        progress,
        reset,
        errors,
        transform,
    } = useForm({
        image: null as File | null,
        binding_type: 'default' as BindingType,
        variant_id: DEFAULT_BINDING_TARGET,
        primary_color_id: DEFAULT_BINDING_TARGET,
        addon_product_id: DEFAULT_BINDING_TARGET,
        alt_text: '',
        sort_order: '0',
    });
    const [imageState, setImageState] = useState<
        Record<string, ImageEditState>
    >(() =>
        Object.fromEntries(
            (product.images ?? []).map((image): [string, ImageEditState] => [
                image.id,
                {
                    binding_type: image.binding_type ?? 'default',
                    variant_id: image.variant_id ?? DEFAULT_BINDING_TARGET,
                    primary_color_id: image.primary_color_id
                        ? String(image.primary_color_id)
                        : DEFAULT_BINDING_TARGET,
                    addon_product_id:
                        image.addon_product_id ?? DEFAULT_BINDING_TARGET,
                    alt_text: image.alt_text ?? '',
                    sort_order: String(image.sort_order ?? 0),
                },
            ]),
        ),
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.image) {
            return;
        }

        transform(() => ({
            image: data.image,
            ...buildImagePayload({
                binding_type: data.binding_type,
                variant_id: data.variant_id,
                primary_color_id: data.primary_color_id,
                addon_product_id: data.addon_product_id,
                alt_text: data.alt_text,
                sort_order: data.sort_order,
            }),
        }));
        post(`/admin/products/${product.id}/images`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Image uploaded.');
            },
        });
    };

    const updateImageState = <K extends keyof ImageEditState>(
        imageId: string,
        field: K,
        value: ImageEditState[K],
    ) => {
        setImageState((current) => {
            const next = { ...current[imageId] };
            next[field] = value;

            return { ...current, [imageId]: next };
        });
    };

    const updateImage = (imageId: string) => {
        const currentState = imageState[imageId];
        const payload = buildImagePayload(currentState);

        router.patch(
            `/admin/products/${product.id}/images/${imageId}`,
            payload,
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Image updated.'),
            },
        );
    };

    const setPrimary = (imageId: string) => {
        router.patch(
            `/admin/products/${product.id}/images/${imageId}/primary`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Primary image set.'),
            },
        );
    };

    const deleteImage = (imageId: string) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(`/admin/products/${product.id}/images/${imageId}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Image deleted.'),
            });
        }
    };

    return (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <h3 className="text-sm font-medium">Product Images</h3>
            <p className="text-xs text-muted-foreground">
                Upload and bind product images for the default gallery,
                variants, primary colors, and addon combinations.
            </p>

            <div className="space-y-4 rounded-md border bg-background p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <div className="relative flex min-h-52 flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center transition-colors hover:bg-muted/50">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            onChange={(e) =>
                                setData('image', e.target.files?.[0] || null)
                            }
                        />
                        <UploadCloud className="mb-2 size-8 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Upload Image
                        </span>
                        {data.image && (
                            <span className="mt-1 w-full truncate text-xs text-primary">
                                {data.image.name}
                            </span>
                        )}
                        {progress && (
                            <div className="mt-2 h-1 w-full overflow-hidden rounded bg-secondary">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        )}
                        <InputError message={errors.image} />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Binding Type</Label>
                            <Select
                                value={data.binding_type}
                                onValueChange={(value: BindingType) =>
                                    setData('binding_type', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">
                                        Default Product Image
                                    </SelectItem>
                                    <SelectItem value="variant">
                                        Variant Image
                                    </SelectItem>
                                    <SelectItem value="primary_color">
                                        Primary Color Image
                                    </SelectItem>
                                    <SelectItem value="addon">
                                        Addon Combo Image
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {data.binding_type === 'variant' && (
                            <div className="space-y-2">
                                <Label>Variant</Label>
                                <Select
                                    value={data.variant_id}
                                    onValueChange={(value) =>
                                        setData('variant_id', value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={DEFAULT_BINDING_TARGET}
                                        >
                                            Select variant
                                        </SelectItem>
                                        {product.variants?.map((variant) => (
                                            <SelectItem
                                                key={variant.id}
                                                value={variant.id}
                                            >
                                                {variant.name || variant.sku}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.variant_id} />
                            </div>
                        )}

                        {data.binding_type === 'primary_color' && (
                            <div className="space-y-2">
                                <Label>Primary Color</Label>
                                <Select
                                    value={data.primary_color_id}
                                    onValueChange={(value) =>
                                        setData('primary_color_id', value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={DEFAULT_BINDING_TARGET}
                                        >
                                            Select color
                                        </SelectItem>
                                        {product.main_colors?.map((entry) => (
                                            <SelectItem
                                                key={entry.id}
                                                value={String(entry.color_id)}
                                            >
                                                {entry.color.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.primary_color_id} />
                            </div>
                        )}

                        {data.binding_type === 'addon' && (
                            <div className="space-y-2">
                                <Label>Addon Product</Label>
                                <Select
                                    value={data.addon_product_id}
                                    onValueChange={(value) =>
                                        setData('addon_product_id', value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select addon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={DEFAULT_BINDING_TARGET}
                                        >
                                            Select addon
                                        </SelectItem>
                                        {product.add_ons?.map((addOn) => (
                                            <SelectItem
                                                key={addOn.id}
                                                value={addOn.id}
                                            >
                                                {addOn.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.addon_product_id} />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="image-alt-text">Alt Text</Label>
                            <Input
                                id="image-alt-text"
                                value={data.alt_text}
                                onChange={(e) =>
                                    setData('alt_text', e.target.value)
                                }
                                placeholder="Describe this image"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image-sort-order">Sort Order</Label>
                            <Input
                                id="image-sort-order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData('sort_order', e.target.value)
                                }
                            />
                        </div>

                        <Button
                            type="button"
                            disabled={processing || !data.image}
                            className="w-full"
                            onClick={submit}
                        >
                            Upload Bound Image
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {product.images?.map((img) => (
                    <div
                        key={img.id}
                        className="overflow-hidden rounded-md border bg-background"
                    >
                        <div className="group relative flex aspect-4/3 items-center justify-center bg-muted/20">
                            <img
                                src={img.url}
                                alt={img.file_name}
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="flex justify-between">
                                    {img.is_primary ? (
                                        <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            <Star className="size-3 fill-current" />{' '}
                                            Primary
                                        </span>
                                    ) : img.binding_type === 'default' ? (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => setPrimary(img.id)}
                                        >
                                            Set Primary
                                        </Button>
                                    ) : (
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                            {bindingLabel(img)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => deleteImage(img.id)}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    {img.file_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {bindingLabel(img)}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Binding Type</Label>
                                    <Select
                                        value={
                                            imageState[img.id]?.binding_type ??
                                            'default'
                                        }
                                        onValueChange={(value: BindingType) =>
                                            updateImageState(
                                                img.id,
                                                'binding_type',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">
                                                Default Product Image
                                            </SelectItem>
                                            <SelectItem value="variant">
                                                Variant Image
                                            </SelectItem>
                                            <SelectItem value="primary_color">
                                                Primary Color Image
                                            </SelectItem>
                                            <SelectItem value="addon">
                                                Addon Combo Image
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {imageState[img.id]?.binding_type ===
                                    'variant' && (
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Variant</Label>
                                        <Select
                                            value={
                                                imageState[img.id]
                                                    ?.variant_id ??
                                                DEFAULT_BINDING_TARGET
                                            }
                                            onValueChange={(value) =>
                                                updateImageState(
                                                    img.id,
                                                    'variant_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select variant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        DEFAULT_BINDING_TARGET
                                                    }
                                                >
                                                    Select variant
                                                </SelectItem>
                                                {product.variants?.map(
                                                    (variant) => (
                                                        <SelectItem
                                                            key={variant.id}
                                                            value={variant.id}
                                                        >
                                                            {variant.name ||
                                                                variant.sku}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {imageState[img.id]?.binding_type ===
                                    'primary_color' && (
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Primary Color</Label>
                                        <Select
                                            value={
                                                imageState[img.id]
                                                    ?.primary_color_id ??
                                                DEFAULT_BINDING_TARGET
                                            }
                                            onValueChange={(value) =>
                                                updateImageState(
                                                    img.id,
                                                    'primary_color_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        DEFAULT_BINDING_TARGET
                                                    }
                                                >
                                                    Select color
                                                </SelectItem>
                                                {product.main_colors?.map(
                                                    (entry) => (
                                                        <SelectItem
                                                            key={entry.id}
                                                            value={String(
                                                                entry.color_id,
                                                            )}
                                                        >
                                                            {entry.color.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {imageState[img.id]?.binding_type ===
                                    'addon' && (
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Addon Product</Label>
                                        <Select
                                            value={
                                                imageState[img.id]
                                                    ?.addon_product_id ??
                                                DEFAULT_BINDING_TARGET
                                            }
                                            onValueChange={(value) =>
                                                updateImageState(
                                                    img.id,
                                                    'addon_product_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select addon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value={
                                                        DEFAULT_BINDING_TARGET
                                                    }
                                                >
                                                    Select addon
                                                </SelectItem>
                                                {product.add_ons?.map(
                                                    (addOn) => (
                                                        <SelectItem
                                                            key={addOn.id}
                                                            value={addOn.id}
                                                        >
                                                            {addOn.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Alt Text</Label>
                                    <Input
                                        value={
                                            imageState[img.id]?.alt_text ?? ''
                                        }
                                        onChange={(e) =>
                                            updateImageState(
                                                img.id,
                                                'alt_text',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Describe this image"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Sort Order</Label>
                                    <Input
                                        type="number"
                                        value={
                                            imageState[img.id]?.sort_order ??
                                            '0'
                                        }
                                        onChange={(e) =>
                                            updateImageState(
                                                img.id,
                                                'sort_order',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        className="w-full"
                                        onClick={() => updateImage(img.id)}
                                    >
                                        Save Image Settings
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function buildImagePayload(state: {
    binding_type: BindingType;
    variant_id: string;
    primary_color_id: string;
    addon_product_id: string;
    alt_text: string;
    sort_order: string;
}) {
    return {
        variant_id:
            state.binding_type === 'variant' &&
            state.variant_id !== DEFAULT_BINDING_TARGET
                ? state.variant_id
                : null,
        primary_color_id:
            state.binding_type === 'primary_color' &&
            state.primary_color_id !== DEFAULT_BINDING_TARGET
                ? Number(state.primary_color_id)
                : null,
        addon_product_id:
            state.binding_type === 'addon' &&
            state.addon_product_id !== DEFAULT_BINDING_TARGET
                ? state.addon_product_id
                : null,
        alt_text: state.alt_text || null,
        sort_order: Number(state.sort_order || 0),
    };
}

function bindingLabel(image: ProductImage) {
    if (image.binding_type === 'variant') {
        return `Variant: ${image.variant?.name || image.variant?.sku || 'Unknown'}`;
    }

    if (image.binding_type === 'primary_color') {
        return `Primary Color: ${image.primary_color?.name || 'Unknown'}`;
    }

    if (image.binding_type === 'addon') {
        return `Addon Combo: ${image.addon_product?.name || 'Unknown'}`;
    }

    return 'Default Product Image';
}
