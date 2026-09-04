import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminProduct, SelectOption } from '@/types/admin-product';

// Editable add-on row shape
type AddOnRow = {
    add_on_product_id: string;
    is_active: boolean;
    sort_order: string;
};

export function AddOnsPanel({
    product,
    addOnProducts,
}: {
    product: AdminProduct;
    addOnProducts: SelectOption[];
}) {
    const { data, setData, post, processing } = useForm<{
        add_ons: AddOnRow[];
    }>({
        add_ons:
            product.add_ons?.map((addon) => ({
                add_on_product_id: addon.pivot.add_on_product_id,
                is_active: addon.pivot.is_active ?? true,
                sort_order: String(addon.pivot.sort_order ?? 0),
            })) || [],
    });

    const addAddOn = () =>
        setData('add_ons', [
            ...data.add_ons,
            { add_on_product_id: '', is_active: true, sort_order: '0' },
        ]);
    const removeAddOn = (index: number) =>
        setData(
            'add_ons',
            data.add_ons.filter((_, i) => i !== index),
        );
    const updateAddOn = <K extends keyof AddOnRow>(
        index: number,
        field: K,
        value: AddOnRow[K],
    ) => {
        const newAddOns = [...data.add_ons];
        const row = { ...newAddOns[index] };
        row[field] = value;
        newAddOns[index] = row;
        setData('add_ons', newAddOns);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/add-ons`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Add-ons updated.'),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-lg border bg-muted/20 p-4"
        >
            <h3 className="text-sm font-medium">Add-On Products</h3>
            <p className="text-xs text-muted-foreground">
                Link other products as optional add-ons.
            </p>

            <div className="space-y-3">
                {data.add_ons.map((addon, index) => (
                    <div
                        key={index}
                        className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-[minmax(0,1fr)_120px_100px_auto] md:items-center"
                    >
                        <div className="flex-1">
                            <Label className="mb-2 block text-xs">
                                Product
                            </Label>
                            <Select
                                value={addon.add_on_product_id}
                                onValueChange={(v) =>
                                    updateAddOn(index, 'add_on_product_id', v)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select add-on product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {addOnProducts.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs">
                                Sort Order
                            </Label>
                            <Input
                                type="number"
                                value={addon.sort_order}
                                onChange={(e) =>
                                    updateAddOn(
                                        index,
                                        'sort_order',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <label className="flex items-center gap-2 pt-6">
                            <Checkbox
                                checked={addon.is_active}
                                onCheckedChange={(checked) =>
                                    updateAddOn(index, 'is_active', !!checked)
                                }
                            />
                            <span className="text-sm">Active</span>
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAddOn(index)}
                            className="text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 border-t pt-2">
                <Button type="button" variant="secondary" onClick={addAddOn}>
                    Add Row
                </Button>
                <Button type="submit" disabled={processing}>
                    Save Add-Ons
                </Button>
            </div>
        </form>
    );
}
