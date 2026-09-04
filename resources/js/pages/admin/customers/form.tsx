import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    date_of_birth: string | null;
    company_name: string | null;
    notes: string | null;
    is_active: boolean;
} | null;

type Props = {
    customer: Customer;
};

/**
 * Customer create/edit form page.
 */
export default function CustomerForm({ customer }: Props) {
    const isEditing = customer !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        first_name: customer?.first_name ?? '',
        last_name: customer?.last_name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        date_of_birth: customer?.date_of_birth ?? '',
        company_name: customer?.company_name ?? '',
        notes: customer?.notes ?? '',
        is_active: customer?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/customers/${customer.id}`);
        } else {
            post('/admin/customers');
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Edit ${customer.first_name} ${customer.last_name}`
                        : 'Create Customer'
                }
            />
            <FormPage
                title={
                    isEditing
                        ? `Edit ${customer.first_name} ${customer.last_name}`
                        : 'Create Customer'
                }
                backUrl="/admin/customers"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                                placeholder="First name"
                            />
                            <InputError message={errors.first_name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                placeholder="Last name"
                            />
                            <InputError message={errors.last_name} />
                        </div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="customer@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="+44 ..."
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    {/* DOB and Company */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) =>
                                    setData('date_of_birth', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                value={data.company_name}
                                onChange={(e) =>
                                    setData('company_name', e.target.value)
                                }
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Optional notes about this customer"
                        />
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', !!v)}
                        />
                        <span className="text-sm">Active</span>
                    </label>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Customer' : 'Create Customer'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
