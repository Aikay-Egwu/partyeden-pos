import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TaxCategory = {
    id: string;
    name: string;
    rate: string;
    is_default: boolean;
    is_active: boolean;
} | null;
type Props = { taxCategory: TaxCategory };

export default function TaxCategoryForm({ taxCategory }: Props) {
    const isEditing = taxCategory !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        name: taxCategory?.name ?? '',
        rate: taxCategory?.rate ?? '0',
        is_default: taxCategory?.is_default ?? false,
        is_active: taxCategory?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/tax-categories/${taxCategory.id}`);
        } else {
            post('/admin/tax-categories');
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Edit ${taxCategory.name}`
                        : 'Create Tax Category'
                }
            />
            <FormPage
                title={
                    isEditing
                        ? `Edit ${taxCategory.name}`
                        : 'Create Tax Category'
                }
                backUrl="/admin/tax-categories"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. VAT, Sales Tax"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate">Rate (%)</Label>
                        <Input
                            id="rate"
                            type="number"
                            step="0.01"
                            value={data.rate}
                            onChange={(e) => setData('rate', e.target.value)}
                        />
                        <InputError message={errors.rate} />
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_default}
                                onCheckedChange={(v) =>
                                    setData('is_default', !!v)
                                }
                            />
                            <span className="text-sm">Default</span>
                        </label>
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
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
