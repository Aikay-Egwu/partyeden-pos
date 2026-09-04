import { router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Shape of a single attribute value row.
export type AttributeValue = {
    id: string;
    value: string;
    code: string | null;
    color_hex: string | null;
    sort_order: number;
    is_active: boolean;
};

// Minimal parent-attribute shape needed by this panel.
type AttributeForPanel = {
    id: string;
    type: string;
    values: AttributeValue[];
};

export function AttributeValuesPanel({
    attribute,
}: {
    attribute: AttributeForPanel;
}) {
    const isColor = attribute.type === 'color';
    const [editingId, setEditingId] = useState<string | null>(null);
    const { data, setData, post, processing, reset, errors, clearErrors } =
        useForm({
            value: '',
            code: '',
            color_hex: isColor ? '#000000' : '',
            sort_order: '0',
            is_active: true,
        });

    const cancelEditing = () => {
        reset();
        clearErrors();
        setEditingId(null);
    };

    const editValue = (val: AttributeValue) => {
        setEditingId(val.id);
        clearErrors();
        setData({
            value: val.value ?? '',
            code: val.code ?? '',
            color_hex: val.color_hex ?? (isColor ? '#000000' : ''),
            sort_order: String(val.sort_order ?? 0),
            is_active: val.is_active ?? true,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const onSuccess = () => {
            reset();
            setEditingId(null);
            toast.success(editingId ? 'Value updated.' : 'Value created.');
        };

        if (editingId) {
            router.put(
                `/admin/attributes/${attribute.id}/values/${editingId}`,
                data,
                { preserveScroll: true, onSuccess },
            );

            return;
        }

        post(`/admin/attributes/${attribute.id}/values`, {
            preserveScroll: true,
            onSuccess,
        });
    };

    const deleteValue = (valueId: string) => {
        if (!confirm('Are you sure you want to delete this value?')) {
            return;
        }

        router.delete(`/admin/attributes/${attribute.id}/values/${valueId}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Value deleted.'),
        });
    };

    return (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
            <div className="space-y-1">
                <h3 className="text-sm font-medium">Attribute Values</h3>
                <p className="text-xs text-muted-foreground">
                    Add the selectable options for this attribute (e.g. Small,
                    Medium, Large).
                </p>
            </div>

            <div className="space-y-2">
                {attribute.values?.map((val) => (
                    <div
                        key={val.id}
                        className="flex items-center justify-between rounded-md border bg-background p-3"
                    >
                        <div className="flex items-center gap-3">
                            {isColor && val.color_hex && (
                                <span
                                    className="inline-block size-5 rounded border"
                                    style={{ backgroundColor: val.color_hex }}
                                    aria-hidden
                                />
                            )}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    {val.value}
                                    {!val.is_active && (
                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    {val.code && <span>Code: {val.code}</span>}
                                    <span>Sort: {val.sort_order}</span>
                                    {isColor && val.color_hex && (
                                        <span>Hex: {val.color_hex}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => editValue(val)}
                            >
                                Edit
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteValue(val.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {(!attribute.values || attribute.values.length === 0) && (
                    <div className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
                        No values added yet.
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">
                    {editingId ? 'Edit Value' : 'Add New Value'}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Value *</Label>
                        <Input
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            required
                            placeholder="e.g. Small, Red"
                        />
                        <InputError message={errors.value} />
                    </div>
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Optional short code (e.g. S, RED)"
                        />
                        <InputError message={errors.code} />
                    </div>
                </div>

                {isColor && (
                    <div className="space-y-2">
                        <Label>Color Hex</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={data.color_hex || '#000000'}
                                onChange={(e) =>
                                    setData('color_hex', e.target.value)
                                }
                                className="h-9 w-12 cursor-pointer rounded border bg-background"
                                aria-label="Pick color"
                            />
                            <Input
                                value={data.color_hex}
                                onChange={(e) =>
                                    setData('color_hex', e.target.value)
                                }
                                placeholder="#RRGGBB"
                                className="max-w-[140px]"
                            />
                        </div>
                        <InputError message={errors.color_hex} />
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input
                            type="number"
                            value={data.sort_order}
                            onChange={(e) =>
                                setData('sort_order', e.target.value)
                            }
                        />
                        <InputError message={errors.sort_order} />
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

                <div className="flex gap-2">
                    {editingId && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditing}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={processing}>
                        {editingId ? 'Update Value' : 'Add Value'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
