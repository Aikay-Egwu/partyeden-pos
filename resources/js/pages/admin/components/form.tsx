import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Component = {
    id: string;
    name: string;
    sku: string;
    cost_price: string;
    selling_price: string;
    is_active: boolean;
} | null;

type Props = {
    component: Component;
};

export default function ComponentForm({ component }: Props) {
    const isEditing = component !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: component?.name ?? '',
        sku: component?.sku ?? '',
        cost_price: component?.cost_price ?? '0',
        selling_price: component?.selling_price ?? '0',
        is_active: component?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/components/${component.id}`);
        } else {
            post('/admin/components');
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing ? `Edit ${component.name}` : 'Create Component'
                }
            />
            <FormPage
                title={
                    isEditing ? `Edit ${component.name}` : 'Create Component'
                }
                backUrl="/admin/components"
            >
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Component name"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                placeholder="SKU-123"
                            />
                            <InputError message={errors.sku} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cost_price">Cost Price</Label>
                            <Input
                                id="cost_price"
                                type="number"
                                step="0.01"
                                value={data.cost_price}
                                onChange={(e) =>
                                    setData('cost_price', e.target.value)
                                }
                            />
                            <InputError message={errors.cost_price} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="selling_price">Selling Price</Label>
                            <Input
                                id="selling_price"
                                type="number"
                                step="0.01"
                                value={data.selling_price}
                                onChange={(e) =>
                                    setData('selling_price', e.target.value)
                                }
                            />
                            <InputError message={errors.selling_price} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', !!v)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Component' : 'Create Component'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
