import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Minus, Plus, Trash2 } from 'lucide-react';
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
    _removed?: boolean;
};

export function StockPanel({
    product,
    locations,
}: {
    product: AdminProduct;
    locations: SelectOption[];
}) {
    const initialEntries: StockEntry[] =
        product.inventory_balances?.map((b) => ({
            location_id: b.location_id,
            quantity: b.quantity,
            reason: '',
            location: b.location,
        })) ?? [];

    const { data, setData, post, processing } = useForm<{
        stock_entries: StockEntry[];
    }>({
        stock_entries: initialEntries,
    });

    // Totals — count only non-removed entries
    const activeEntries = data.stock_entries.filter((e) => !e._removed);
    const totalStock = activeEntries.reduce(
        (sum, e) => sum + (Number(e.quantity) || 0),
        0,
    );

    const addEntry = (locationId: string) => {
        const location = locations.find((l) => l.id === locationId);

        if (!location) {
            return;
        }

        // If this location was previously removed in this session, restore it
        const removedIndex = data.stock_entries.findIndex(
            (e) => e.location_id === locationId && e._removed,
        );

        if (removedIndex !== -1) {
            const restored = [...data.stock_entries];
            restored[removedIndex] = {
                ...restored[removedIndex],
                _removed: false,
                quantity: 0,
                reason: '',
            };
            setData('stock_entries', restored);

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
        const updated = [...data.stock_entries];
        const entry = { ...updated[index] };
        const wasPersisted = initialEntries.some(
            (e) => e.location_id === entry.location_id,
        );

        if (wasPersisted) {
            // Mark as removed so the backend zeroes the balance on submit
            entry._removed = true;
            entry.quantity = 0;
            entry.reason = entry.reason || 'Removed from product';
            updated[index] = entry;
        } else {
            updated.splice(index, 1);
        }

        setData('stock_entries', updated);
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
        (loc) =>
            !data.stock_entries.some(
                (e) => e.location_id === loc.id && !e._removed,
            ),
    );

    const visibleEntries = data.stock_entries
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => !entry._removed);

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-lg border bg-muted/20 p-4"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-medium">Stock Levels</h3>
                    <p className="text-xs text-muted-foreground">
                        Add stock at each location. Every save creates an
                        inventory movement record.
                    </p>
                </div>
                <div className="rounded-md border bg-background px-3 py-1.5 text-xs">
                    <span className="text-muted-foreground">
                        Total in stock:
                    </span>{' '}
                    <span className="font-semibold">{totalStock}</span>
                </div>
            </div>

            {locations.length === 0 ? (
                <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <div>
                        <p className="font-medium">No locations configured</p>
                        <p className="text-xs">
                            Stock is tracked per location.{' '}
                            <Link
                                href="/admin/locations"
                                className="underline hover:no-underline"
                            >
                                Create a location
                            </Link>{' '}
                            first, then come back to add stock.
                        </p>
                    </div>
                </div>
            ) : visibleEntries.length > 0 ? (
                <div className="space-y-3">
                    {visibleEntries.map(({ entry, index }) => (
                        <div
                            key={entry.location_id}
                            className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)_auto] md:items-end"
                        >
                            <div className="space-y-1">
                                <Label className="text-xs">Location</Label>
                                <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
                                    {entry.location?.name ?? 'Unknown Location'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Quantity</Label>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-9 shrink-0"
                                        onClick={() =>
                                            updateEntry(
                                                index,
                                                'quantity',
                                                Math.max(
                                                    0,
                                                    Number(entry.quantity) - 1,
                                                ),
                                            )
                                        }
                                        aria-label="Decrease stock"
                                    >
                                        <Minus className="size-4" />
                                    </Button>
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
                                        className="text-center"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-9 shrink-0"
                                        onClick={() =>
                                            updateEntry(
                                                index,
                                                'quantity',
                                                Number(entry.quantity) + 1,
                                            )
                                        }
                                        aria-label="Increase stock"
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">
                                    Reason (optional)
                                </Label>
                                <Input
                                    type="text"
                                    value={entry.reason ?? ''}
                                    placeholder="e.g. Stocktake, delivery"
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
                                size="icon"
                                onClick={() => removeEntry(index)}
                                className="size-9 text-destructive hover:text-destructive"
                                aria-label="Remove stock entry"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border border-dashed bg-background/50 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No stock recorded for this product yet.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Use the control below to add stock at a location.
                    </p>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                {locationsWithoutStock.length > 0 ? (
                    <Select value="" onValueChange={addEntry}>
                        <SelectTrigger className="w-full sm:w-64">
                            <SelectValue placeholder="Select a location..." />
                        </SelectTrigger>
                        <SelectContent>
                            {locationsWithoutStock.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : locations.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                        Stock has been added for every location.
                    </p>
                ) : null}

                <Button
                    type="submit"
                    disabled={processing || locations.length === 0}
                    className="sm:ml-auto"
                >
                    Save Stock
                </Button>
            </div>
        </form>
    );
}
