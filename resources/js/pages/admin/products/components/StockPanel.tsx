import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import type { AdminProduct, SelectOption } from '@/types/admin-product';

type StockEntry = {
    location_id: string;
    quantity: number;
    reason: string;
    location?: { id: string; name: string };
};

export function StockPanel({
    product,
    locations,
}: {
    product: AdminProduct;
    locations: SelectOption[];
}) {
    const { data, setData, post, processing } = useForm<{
        stock_entries: StockEntry[];
    }>({
        stock_entries:
            product.inventory_balances?.map((b) => ({
                location_id: b.location_id,
                quantity: b.quantity,
                reason: '',
                location: b.location,
            })) || [],
    });

    const addEntry = (locationId: string) => {
        const location = locations.find((l) => l.id === locationId);

        if (!location) {
            return;
        }

        setData('stock_entries', [
            ...data.stock_entries,
            {
                location_id: locationId,
                quantity: 0,
                reason: '',
                location: { id: location.id, name: location.name },
            },
        ]);
    };

    const removeEntry = (index: number) => {
        setData(
            'stock_entries',
            data.stock_entries.filter((_, i) => i !== index),
        );
    };

    const updateEntry = <K extends keyof StockEntry>(
        index: number,
        field: K,
        value: StockEntry[K],
    ) => {
        const updated = [...data.stock_entries];
        const entry = { ...updated[index] };
        entry[field] = value;
        updated[index] = entry;
        setData('stock_entries', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/stock`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Stock levels updated.'),
        });
    };

    const locationsWithoutStock = locations.filter(
        (loc) => !data.stock_entries.some((e) => e.location_id === loc.id),
    );

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-lg border bg-muted/20 p-4"
        >
            <h3 className="text-sm font-medium">Stock Levels</h3>
            <p className="text-xs text-muted-foreground">
                Adjust stock quantities per location. Each change creates an
                inventory movement record.
            </p>

            {data.stock_entries.length > 0 ? (
                <div className="space-y-3">
                    {data.stock_entries.map((entry, index) => (
                        <div
                            key={entry.location_id}
                            className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
                        >
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    {entry.location?.name ?? 'Unknown Location'}
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={entry.quantity}
                                    onChange={(e) =>
                                        updateEntry(
                                            index,
                                            'quantity',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Reason</Label>
                                <Input
                                    type="text"
                                    value={entry.reason ?? ''}
                                    placeholder="Reason for change"
                                    onChange={(e) =>
                                        updateEntry(
                                            index,
                                            'reason',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEntry(index)}
                                className="text-destructive"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">
                    No stock entries for this product. Add stock at a location
                    below.
                </p>
            )}

            <div className="flex gap-2 border-t pt-2">
                {locationsWithoutStock.length > 0 && (
                    <div className="flex-1">
                        <Select value="" onValueChange={addEntry}>
                            <SelectTrigger className="w-full max-w-xs">
                                <SelectValue placeholder="Add a location..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locationsWithoutStock.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <Button type="submit" disabled={processing}>
                    Save Stock
                </Button>
            </div>
        </form>
    );
}
