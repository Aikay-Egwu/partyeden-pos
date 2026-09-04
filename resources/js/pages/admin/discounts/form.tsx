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

type Discount = {
    id: string;
    name: string;
    code: string;
    type: string;
    value: string;
    min_purchase_amount: string | null;
    max_discount_amount: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    is_stackable: boolean;
    apply_to_all: boolean;
} | null;

type Props = {
    discount: Discount;
};

/**
 * Discount create/edit form page.
 */
export default function DiscountForm({ discount }: Props) {
    const isEditing = discount !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: discount?.name ?? '',
        code: discount?.code ?? '',
        type: discount?.type ?? 'percentage',
        value: discount?.value ?? '0',
        min_purchase_amount: discount?.min_purchase_amount ?? '',
        max_discount_amount: discount?.max_discount_amount ?? '',
        starts_at: discount?.starts_at ?? '',
        ends_at: discount?.ends_at ?? '',
        is_active: discount?.is_active ?? true,
        is_stackable: discount?.is_stackable ?? false,
        apply_to_all: discount?.apply_to_all ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/discounts/${discount.id}`);
        } else {
            post('/admin/discounts');
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${discount.name}` : 'Create Discount'}
            />
            <FormPage
                title={isEditing ? `Edit ${discount.name}` : 'Create Discount'}
                backUrl="/admin/discounts"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Code */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Summer Sale"
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
                                placeholder="SUMMER20"
                            />
                            <InputError message={errors.code} />
                        </div>
                    </div>

                    {/* Type and Value */}
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
                                    <SelectItem value="percentage">
                                        Percentage
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                        Fixed Amount
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                value={data.value}
                                onChange={(e) =>
                                    setData('value', e.target.value)
                                }
                            />
                            <InputError message={errors.value} />
                        </div>
                    </div>

                    {/* Min purchase and max discount */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="min_purchase_amount">
                                Min Purchase Amount
                            </Label>
                            <Input
                                id="min_purchase_amount"
                                type="number"
                                step="0.01"
                                value={data.min_purchase_amount}
                                onChange={(e) =>
                                    setData(
                                        'min_purchase_amount',
                                        e.target.value,
                                    )
                                }
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_discount_amount">
                                Max Discount Amount
                            </Label>
                            <Input
                                id="max_discount_amount"
                                type="number"
                                step="0.01"
                                value={data.max_discount_amount}
                                onChange={(e) =>
                                    setData(
                                        'max_discount_amount',
                                        e.target.value,
                                    )
                                }
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Date range */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="starts_at">Start Date</Label>
                            <Input
                                id="starts_at"
                                type="date"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData('starts_at', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ends_at">End Date</Label>
                            <Input
                                id="ends_at"
                                type="date"
                                value={data.ends_at}
                                onChange={(e) =>
                                    setData('ends_at', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_active}
                                onCheckedChange={(v) =>
                                    setData('is_active', !!v)
                                }
                            />
                            <span className="text-sm">Active</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_stackable}
                                onCheckedChange={(v) =>
                                    setData('is_stackable', !!v)
                                }
                            />
                            <span className="text-sm">Stackable</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.apply_to_all}
                                onCheckedChange={(v) =>
                                    setData('apply_to_all', !!v)
                                }
                            />
                            <span className="text-sm">
                                Apply to all products
                            </span>
                        </label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Discount' : 'Create Discount'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
