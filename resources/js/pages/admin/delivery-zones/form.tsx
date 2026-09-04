import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DeliveryZone = {
    id: string;
    name: string;
    delivery_price: string;
    min_order_amount: string | null;
    is_active: boolean;
    notes: string | null;
    prefixes: { id: string; code_prefix: string }[];
};

type Props = {
    zone: DeliveryZone | null;
};

export default function DeliveryZoneForm({ zone }: Props) {
    const isEdit = !!zone;

    // We store the prefixes as an array of strings for the form
    const [prefixes, setPrefixes] = useState<string[]>(
        zone?.prefixes ? zone.prefixes.map((p) => p.code_prefix) : [],
    );
    const [newPrefix, setNewPrefix] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        name: zone?.name ?? '',
        delivery_price: zone?.delivery_price ?? '',
        min_order_amount: zone?.min_order_amount ?? '',
        is_active: zone?.is_active ?? true,
        notes: zone?.notes ?? '',
        prefixes: prefixes,
    });

    // Update form state whenever prefixes changes
    const updatePrefixes = (newPrefixes: string[]) => {
        setPrefixes(newPrefixes);
        setData('prefixes', newPrefixes);
    };

    const addPrefix = () => {
        const cleaned = newPrefix.trim().toUpperCase();

        if (cleaned && !prefixes.includes(cleaned)) {
            updatePrefixes([...prefixes, cleaned]);
        }

        setNewPrefix('');
    };

    const removePrefix = (prefixToRemove: string) => {
        updatePrefixes(prefixes.filter((p) => p !== prefixToRemove));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/delivery-zones/${zone.id}`);
        } else {
            post('/admin/delivery-zones');
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Zone' : 'New Zone'} />
            <div className="mx-auto max-w-3xl space-y-6">
                <Button asChild variant="ghost" size="sm" className="gap-1">
                    <Link href="/admin/delivery-zones">
                        <ArrowLeft className="size-4" />
                        Back to Delivery Zones
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit ? 'Edit Delivery Zone' : 'New Delivery Zone'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-lg border p-6"
                >
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="name">Zone Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Local Zone A, National"
                            />

                            <InputError message={errors.name} />
                        </div>

                        {/* Delivery Price */}
                        <div className="space-y-2">
                            <Label htmlFor="delivery_price">
                                Delivery Price (£)
                            </Label>
                            <Input
                                id="delivery_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.delivery_price}
                                onChange={(e) =>
                                    setData('delivery_price', e.target.value)
                                }
                            />

                            <InputError message={errors.delivery_price} />
                        </div>

                        {/* Min Order Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="min_order_amount">
                                Min Order Amount (£) (Optional)
                            </Label>
                            <Input
                                id="min_order_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.min_order_amount}
                                onChange={(e) =>
                                    setData('min_order_amount', e.target.value)
                                }
                            />

                            <InputError message={errors.min_order_amount} />
                        </div>

                        {/* Status */}
                        <div className="mt-2 flex items-center space-x-2 sm:col-span-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="size-4 rounded border-gray-300 text-primary"
                            />
                            <Label htmlFor="is_active" className="font-normal">
                                Active (available at checkout)
                            </Label>
                        </div>
                    </div>

                    {/* Postcode Prefixes */}
                    <div className="space-y-4 border-t pt-6">
                        <div>
                            <h2 className="text-lg font-medium">
                                Postcode Prefixes
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Enter the start of postcodes this zone applies
                                to (e.g., NW1, SE10, W).
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={newPrefix}
                                onChange={(e) => setNewPrefix(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPrefix();
                                    }
                                }}
                                placeholder="Enter prefix and press Add"
                                className="max-w-xs uppercase"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addPrefix}
                            >
                                <Plus className="mr-2 size-4" /> Add
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {prefixes.map((prefix) => (
                                <div
                                    key={prefix}
                                    className="flex items-center gap-1 rounded-full border bg-secondary/50 px-3 py-1 text-sm"
                                >
                                    <span className="font-medium uppercase">
                                        {prefix}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removePrefix(prefix)}
                                        className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                            {prefixes.length === 0 && (
                                <span className="text-sm text-muted-foreground italic">
                                    No prefixes added.
                                </span>
                            )}
                        </div>

                        {errors.prefixes && (
                            <InputError message={errors.prefixes} />
                        )}

                        {Object.keys(errors).some((k) =>
                            k.startsWith('prefixes.'),
                        ) && <InputError message="Invalid prefix format." />}
                    </div>

                    <div className="flex justify-end gap-4 border-t pt-6">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/delivery-zones">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Update Zone' : 'Create Zone'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
