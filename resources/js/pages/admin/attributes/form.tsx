import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
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
import { AttributeValuesPanel } from '@/pages/admin/attributes/components/AttributeValuesPanel';
import type { AttributeValue } from '@/pages/admin/attributes/components/AttributeValuesPanel';

type Attribute = {
    id: string;
    name: string;
    code: string;
    type: string;
    sort_order: number;
    is_active: boolean;
    values?: AttributeValue[];
} | null;
type Props = { attribute: Attribute };

export default function AttributeForm({ attribute }: Props) {
    const isEditing = attribute !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        name: attribute?.name ?? '',
        code: attribute?.code ?? '',
        type: attribute?.type ?? 'select',
        sort_order: String(attribute?.sort_order ?? 0),
        is_active: attribute?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/attributes/${attribute.id}`);
        } else {
            post('/admin/attributes');
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing ? `Edit ${attribute.name}` : 'Create Attribute'
                }
            />
            <FormPage
                title={
                    isEditing ? `Edit ${attribute.name}` : 'Create Attribute'
                }
                backUrl="/admin/attributes"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Size, Color"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder="e.g. size, color"
                            />
                            <InputError message={errors.code} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(v) => setData('type', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="select">
                                        Select
                                    </SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="color">Color</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData('sort_order', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', !!v)}
                        />
                        <span className="text-sm">Active</span>
                    </label>
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Attribute' : 'Create Attribute'}
                    </Button>
                </form>

                {isEditing && attribute.type !== 'text' && (
                    <div className="mt-8">
                        <AttributeValuesPanel
                            attribute={{
                                id: attribute.id,
                                type: attribute.type,
                                values: attribute.values ?? [],
                            }}
                        />
                    </div>
                )}
            </FormPage>
        </>
    );
}
