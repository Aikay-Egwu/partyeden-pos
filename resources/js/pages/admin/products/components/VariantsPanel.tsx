import { useForm, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    AdminProduct,
    AttributeOption,
    ProductVariant,
} from '@/types/admin-product';

export function VariantsPanel({
    product,
    attributes,
}: {
    product: AdminProduct;
    attributes: AttributeOption[];
}) {
    const [editingVariantId, setEditingVariantId] = useState<string | null>(
        null,
    );
    const { data, setData, post, processing, reset } = useForm({
        sku: '',
        name: '',
        price_adjustment: '0',
        cost_price_adjustment: '0',
        is_active: true,
        attributes: [] as string[],
    });

    const toggleAttribute = (valueId: string) => {
        if (data.attributes.includes(valueId)) {
            setData(
                'attributes',
                data.attributes.filter((id) => id !== valueId),
            );
        } else {
            setData('attributes', [...data.attributes, valueId]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const onSuccess = () => {
            reset();
            setEditingVariantId(null);
            toast.success(
                editingVariantId ? 'Variant updated.' : 'Variant created.',
            );
        };

        if (editingVariantId) {
            router.put(
                `/admin/products/${product.id}/variants/${editingVariantId}`,
                data,
                {
                    preserveScroll: true,
                    onSuccess,
                },
            );

            return;
        }

        post(`/admin/products/${product.id}/variants`, {
            preserveScroll: true,
            onSuccess,
        });
    };

    const deleteVariant = (variantId: string) => {
        if (confirm('Are you sure you want to delete this variant?')) {
            router.delete(
                `/admin/products/${product.id}/variants/${variantId}`,
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Variant deleted.'),
                },
            );
        }
    };

    const editVariant = (variant: ProductVariant) => {
        setEditingVariantId(variant.id);
        setData({
            sku: variant.sku ?? '',
            name: variant.name ?? '',
            price_adjustment: String(variant.price_adjustment ?? '0'),
            cost_price_adjustment: String(variant.cost_price_adjustment ?? '0'),
            is_active: variant.is_active ?? true,
            attributes:
                variant.attribute_values?.map((value) => value.id) ?? [],
        });
    };

    const cancelEditing = () => {
        reset();
        setEditingVariantId(null);
    };

    return (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <h3 className="text-sm font-medium">Variants</h3>
            <p className="text-xs text-muted-foreground">
                Manage distinct SKUs (e.g. sizes) for this product.
            </p>

            <div className="space-y-4">
                {product.variants?.map((variant) => (
                    <div
                        key={variant.id}
                        className="flex items-center justify-between rounded-md border bg-background p-3"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                {variant.name || 'Unnamed Variant'}
                                {!variant.is_active && (
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>SKU: {variant.sku}</span>
                                <span>
                                    Price Adj: {variant.price_adjustment}
                                </span>
                                <span>
                                    Cost Adj: {variant.cost_price_adjustment}
                                </span>
                            </div>
                            {variant.attribute_values &&
                                variant.attribute_values.length > 0 && (
                                    <div className="mt-1 text-xs">
                                        Attributes:{' '}
                                        {variant.attribute_values
                                            .map((av) => av.value)
                                            .join(', ')}
                                    </div>
                                )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => editVariant(variant)}
                            >
                                Edit
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteVariant(variant.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {product.variants?.length === 0 && (
                    <div className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
                        No variants added yet.
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">
                    {editingVariantId ? 'Edit Variant' : 'Add New Variant'}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>SKU *</Label>
                        <Input
                            value={data.sku}
                            onChange={(e) => setData('sku', e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Small / Red"
                        />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Price Adjustment</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.price_adjustment}
                            onChange={(e) =>
                                setData('price_adjustment', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cost Price Adjustment</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.cost_price_adjustment}
                            onChange={(e) =>
                                setData('cost_price_adjustment', e.target.value)
                            }
                        />
                    </div>
                </div>

                {attributes.length > 0 && (
                    <div className="space-y-2">
                        <Label>Attributes</Label>
                        {attributes.every(
                            (attr) => !attr.values || attr.values.length === 0,
                        ) ? (
                            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                                No attribute values defined yet. Add values
                                under Admin &rarr; Attributes.
                            </div>
                        ) : (
                            <div className="grid max-h-40 gap-4 overflow-y-auto rounded-md border bg-background p-2 sm:grid-cols-3">
                                {attributes.map((attr) => (
                                    <div key={attr.id} className="space-y-1">
                                        <div className="text-xs font-semibold">
                                            {attr.name}
                                        </div>
                                        {attr.values?.map((val) => (
                                            <label
                                                key={val.id}
                                                className="flex items-center gap-2"
                                            >
                                                <Checkbox
                                                    checked={data.attributes.includes(
                                                        val.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleAttribute(val.id)
                                                    }
                                                />
                                                <span className="text-xs">
                                                    {val.value}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={data.is_active}
                        onCheckedChange={(v) => setData('is_active', !!v)}
                    />
                    <span className="text-sm">Active</span>
                </div>

                <div className="flex gap-2">
                    {editingVariantId && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={processing}>
                        {editingVariantId ? 'Update Variant' : 'Add Variant'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
