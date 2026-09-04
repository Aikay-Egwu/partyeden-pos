import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
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
import type { AdminProduct, ColorOption } from '@/types/admin-product';

export function ColorsPanel({
    product,
    colors,
}: {
    product: AdminProduct;
    colors: ColorOption[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        main_colors: product.main_colors?.map((c) => c.color_id) || [],
        secondary_colors:
            product.secondary_colors?.map((c) => c.color_id) || [],
    });
    const {
        data: createData,
        setData: setCreateData,
        post: postCreateColor,
        processing: creatingColor,
        errors: createErrors,
        reset: resetCreateForm,
    } = useForm({
        name: '',
        hex_code: '',
        target: 'main',
    });

    const toggleColor = (
        type: 'main_colors' | 'secondary_colors',
        colorId: number,
    ) => {
        const current = data[type];

        if (current.includes(colorId)) {
            setData(
                type,
                current.filter((id) => id !== colorId),
            );
        } else {
            setData(type, [...current, colorId]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/products/${product.id}/colors`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Colors updated.'),
        });
    };

    const createColor = (e: React.FormEvent) => {
        e.preventDefault();
        postCreateColor(`/admin/products/${product.id}/colors/create`, {
            preserveScroll: true,
            onSuccess: () => {
                resetCreateForm();
                toast.success('Color created.');
            },
        });
    };

    const selectedMainColors = colors.filter((color) =>
        data.main_colors.includes(color.id),
    );
    const selectedSecondaryColors = colors.filter((color) =>
        data.secondary_colors.includes(color.id),
    );

    return (
        <div className="space-y-6 rounded-lg border bg-muted/20 p-4">
            <div className="space-y-1">
                <h3 className="text-sm font-medium">Color Options</h3>
                <p className="text-xs text-muted-foreground">
                    Assign primary and secondary colors, then create new colors
                    inline when the palette is missing an option.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Main Colors</Label>
                            <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                                {colors.map((color) => (
                                    <label
                                        key={color.id}
                                        className="flex items-center gap-2 py-1"
                                    >
                                        <Checkbox
                                            checked={data.main_colors.includes(
                                                color.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleColor(
                                                    'main_colors',
                                                    color.id,
                                                )
                                            }
                                        />
                                        <div
                                            className="size-4 rounded-full border"
                                            style={{
                                                backgroundColor:
                                                    color.hex_code || '#fff',
                                            }}
                                        />
                                        <span className="text-sm">
                                            {color.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.main_colors} />
                        </div>

                        <div className="space-y-2">
                            <Label>Secondary Colors</Label>
                            <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                                {colors.map((color) => (
                                    <label
                                        key={color.id}
                                        className="flex items-center gap-2 py-1"
                                    >
                                        <Checkbox
                                            checked={data.secondary_colors.includes(
                                                color.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleColor(
                                                    'secondary_colors',
                                                    color.id,
                                                )
                                            }
                                        />
                                        <div
                                            className="size-4 rounded-full border"
                                            style={{
                                                backgroundColor:
                                                    color.hex_code || '#fff',
                                            }}
                                        />
                                        <span className="text-sm">
                                            {color.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.secondary_colors} />
                        </div>
                    </div>

                    <div className="space-y-3 rounded-md border bg-background p-3">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Selected main colors
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedMainColors.length > 0 ? (
                                    selectedMainColors.map((color) => (
                                        <span
                                            key={color.id}
                                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                                        >
                                            <span
                                                className="size-3 rounded-full border"
                                                style={{
                                                    backgroundColor:
                                                        color.hex_code ||
                                                        '#fff',
                                                }}
                                            />
                                            {color.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        No main colors selected yet.
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Selected secondary colors
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedSecondaryColors.length > 0 ? (
                                    selectedSecondaryColors.map((color) => (
                                        <span
                                            key={color.id}
                                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                                        >
                                            <span
                                                className="size-3 rounded-full border"
                                                style={{
                                                    backgroundColor:
                                                        color.hex_code ||
                                                        '#fff',
                                                }}
                                            />
                                            {color.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        No secondary colors selected yet.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-2">
                        <Button type="submit" disabled={processing}>
                            Save Colors
                        </Button>
                    </div>
                </form>

                <form
                    onSubmit={createColor}
                    className="space-y-4 rounded-md border bg-background p-4"
                >
                    <div>
                        <h4 className="text-sm font-medium">
                            Create Custom Color
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            New colors are added to the shared palette and
                            attached to this product immediately.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-color-name">Color Name</Label>
                        <Input
                            id="new-color-name"
                            value={createData.name}
                            onChange={(e) =>
                                setCreateData('name', e.target.value)
                            }
                            placeholder="e.g. Rose Gold"
                        />
                        <InputError message={createErrors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-color-hex">Hex Code</Label>
                        <div className="flex items-center gap-3">
                            <span
                                className="size-6 rounded-full border"
                                style={{
                                    backgroundColor:
                                        createData.hex_code || '#fff',
                                }}
                            />
                            <Input
                                id="new-color-hex"
                                value={createData.hex_code}
                                onChange={(e) =>
                                    setCreateData('hex_code', e.target.value)
                                }
                                placeholder="#C9A227"
                            />
                        </div>
                        <InputError message={createErrors.hex_code} />
                    </div>

                    <div className="space-y-2">
                        <Label>Attach As</Label>
                        <Select
                            value={createData.target}
                            onValueChange={(value) =>
                                setCreateData('target', value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="main">Main Color</SelectItem>
                                <SelectItem value="secondary">
                                    Secondary Color
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={createErrors.target} />
                    </div>

                    <Button
                        type="submit"
                        disabled={creatingColor}
                        className="w-full"
                    >
                        Create And Attach Color
                    </Button>
                </form>
            </div>
        </div>
    );
}
