import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminProduct, ComponentOption } from '@/types/admin-product';

const ANY_VARIANT_VALUE = '__any_variant__';

// Editable kit mapping row (new rows have no id yet)
type MappingRow = {
    id?: string;
    product_id: string;
    quantity: string;
    variant_id: string;
};

export function KitMappingsPanel({
    product,
    components,
}: {
    product: AdminProduct;
    components: ComponentOption[];
}) {
    const { data, setData, post, processing } = useForm<{
        mappings: MappingRow[];
    }>({
        mappings:
            product.kit_mappings?.map((km) => ({
                id: km.id,
                product_id: km.product_id,
                quantity: String(km.quantity),
                variant_id: km.variant_id ?? '',
            })) || [],
    });

    const addMapping = () =>
        setData('mappings', [
            ...data.mappings,
            { product_id: '', quantity: '1', variant_id: '' },
        ]);
    const removeMapping = (index: number) =>
        setData(
            'mappings',
            data.mappings.filter((_, i) => i !== index),
        );
    const updateMapping = <K extends keyof MappingRow>(
        index: number,
        field: K,
        value: MappingRow[K],
    ) => {
        const newMappings = [...data.mappings];
        const row = { ...newMappings[index] };
        row[field] = value;
        newMappings[index] = row;
        setData('mappings', newMappings);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/kit-mappings`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Kit mappings updated.'),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-lg border bg-muted/20 p-4"
        >
            <h3 className="text-sm font-medium">Kit Components</h3>
            <p className="text-xs text-muted-foreground">
                Define the components that make up this kit. Only non-kit
                products are shown to prevent circular dependencies.
            </p>

            <div className="space-y-3">
                {data.mappings.map((mapping, index) => (
                    <div
                        key={index}
                        className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-[minmax(0,1fr)_160px_120px_auto] md:items-center"
                    >
                        <div>
                            <Label className="mb-2 block text-xs">
                                Component
                            </Label>
                            <SearchableSelect
                                options={components}
                                value={mapping.product_id}
                                onChange={(v) =>
                                    updateMapping(index, 'product_id', v)
                                }
                                placeholder="Search products…"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs">
                                Variant
                            </Label>
                            <Select
                                value={mapping.variant_id || ANY_VARIANT_VALUE}
                                onValueChange={(v) =>
                                    updateMapping(
                                        index,
                                        'variant_id',
                                        v === ANY_VARIANT_VALUE ? '' : v,
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Any variant" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY_VARIANT_VALUE}>
                                        Any variant
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
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs">
                                Quantity
                            </Label>
                            <Input
                                type="number"
                                step="0.001"
                                value={mapping.quantity}
                                onChange={(e) =>
                                    updateMapping(
                                        index,
                                        'quantity',
                                        e.target.value,
                                    )
                                }
                                placeholder="Qty"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMapping(index)}
                            className="text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 border-t pt-2">
                <Button type="button" variant="secondary" onClick={addMapping}>
                    Add Row
                </Button>
                <Button type="submit" disabled={processing}>
                    Save Mappings
                </Button>
            </div>
        </form>
    );
}
