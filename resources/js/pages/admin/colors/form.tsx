import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Color shape from database
type Color = {
    id: number;
    name: string;
    hex_code: string | null;
    is_active: boolean;
} | null;

type Props = {
    color: Color;
};

/**
 * Color create/edit form page.
 * Admin defines colors (name + hex code) available for balloon customization.
 */
export default function ColorForm({ color }: Props) {
    const isEditing = color !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: color?.name ?? '',
        hex_code: color?.hex_code ?? '',
        is_active: color?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/colors/${color.id}`);
        } else {
            post('/admin/colors');
        }
    };

    return (
        <>
            <Head title={isEditing ? `Edit ${color.name}` : 'Create Color'} />
            <FormPage
                title={isEditing ? `Edit ${color.name}` : 'Create Color'}
                backUrl="/admin/colors"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Color Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder='e.g., "Ruby Red", "Navy Blue"'
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Hex code */}
                    <div className="space-y-2">
                        <Label htmlFor="hex_code">Hex Code</Label>
                        <div className="flex items-center gap-3">
                            {data.hex_code && (
                                <span
                                    className="size-6 rounded-full border"
                                    style={{ backgroundColor: data.hex_code }}
                                />
                            )}
                            <Input
                                id="hex_code"
                                value={data.hex_code}
                                onChange={(e) =>
                                    setData('hex_code', e.target.value)
                                }
                                placeholder="#FF0000"
                                className="flex-1"
                            />
                        </div>
                        <InputError message={errors.hex_code} />
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', !!v)}
                        />
                        <span className="text-sm">
                            Active (available for selection)
                        </span>
                    </label>

                    {/* Submit */}
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Color' : 'Create Color'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
