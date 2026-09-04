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

// Form field shapes
type Supplier = {
    id: string;
    name: string;
    code: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country_id: string | null;
    tax_number: string | null;
    notes: string | null;
    payment_terms: string | null;
    is_active: boolean;
} | null;

type Option = { id: string; name: string };

type Props = {
    supplier: Supplier;
    countries: Option[];
};

/**
 * Supplier create/edit form page.
 * Uses Inertia useForm for validation and submission.
 */
export default function SupplierForm({ supplier, countries }: Props) {
    const isEditing = supplier !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier?.name ?? '',
        code: supplier?.code ?? '',
        contact_name: supplier?.contact_name ?? '',
        email: supplier?.email ?? '',
        phone: supplier?.phone ?? '',
        address_line_1: supplier?.address_line_1 ?? '',
        address_line_2: supplier?.address_line_2 ?? '',
        city: supplier?.city ?? '',
        state: supplier?.state ?? '',
        postal_code: supplier?.postal_code ?? '',
        country_id: supplier?.country_id ?? '',
        tax_number: supplier?.tax_number ?? '',
        notes: supplier?.notes ?? '',
        payment_terms: supplier?.payment_terms ?? '',
        is_active: supplier?.is_active ?? true,
    });

    // Submit to create or update endpoint
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/suppliers/${supplier.id}`);
        } else {
            post('/admin/suppliers');
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${supplier.name}` : 'Create Supplier'}
            />
            <FormPage
                title={isEditing ? `Edit ${supplier.name}` : 'Create Supplier'}
                backUrl="/admin/suppliers"
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
                                placeholder="Supplier name"
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
                                placeholder="SUP-001"
                            />
                            <InputError message={errors.code} />
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contact_name">Contact Name</Label>
                            <Input
                                id="contact_name"
                                value={data.contact_name}
                                onChange={(e) =>
                                    setData('contact_name', e.target.value)
                                }
                            />
                            <InputError message={errors.contact_name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    {/* Phone and Tax Number */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />
                            <InputError message={errors.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax_number">Tax Number</Label>
                            <Input
                                id="tax_number"
                                value={data.tax_number}
                                onChange={(e) =>
                                    setData('tax_number', e.target.value)
                                }
                            />
                            <InputError message={errors.tax_number} />
                        </div>
                    </div>

                    {/* Address fields */}
                    <div className="space-y-2">
                        <Label htmlFor="address_line_1">Address Line 1</Label>
                        <Input
                            id="address_line_1"
                            value={data.address_line_1}
                            onChange={(e) =>
                                setData('address_line_1', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address_line_2">Address Line 2</Label>
                        <Input
                            id="address_line_2"
                            value={data.address_line_2}
                            onChange={(e) =>
                                setData('address_line_2', e.target.value)
                            }
                        />
                    </div>

                    {/* City, State, Postal */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={data.state}
                                onChange={(e) =>
                                    setData('state', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                                id="postal_code"
                                value={data.postal_code}
                                onChange={(e) =>
                                    setData('postal_code', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Country and Payment Terms */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select
                                value={data.country_id}
                                onValueChange={(v) => setData('country_id', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_terms">Payment Terms</Label>
                            <Input
                                id="payment_terms"
                                value={data.payment_terms}
                                onChange={(e) =>
                                    setData('payment_terms', e.target.value)
                                }
                                placeholder="Net 30, Net 60..."
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
                            placeholder="Optional notes about this supplier"
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

                    {/* Submit */}
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Supplier' : 'Create Supplier'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
