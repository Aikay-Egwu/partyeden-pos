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

type Location = {
    id: string;
    name: string;
    code: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    type: string;
    is_active: boolean;
} | null;
type Props = { location: Location };

export default function LocationForm({ location }: Props) {
    const isEditing = location !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        name: location?.name ?? '',
        code: location?.code ?? '',
        address_line_1: location?.address_line_1 ?? '',
        address_line_2: location?.address_line_2 ?? '',
        city: location?.city ?? '',
        state: location?.state ?? '',
        postal_code: location?.postal_code ?? '',
        country: location?.country ?? '',
        phone: location?.phone ?? '',
        email: location?.email ?? '',
        manager_name: location?.manager_name ?? '',
        type: location?.type ?? 'store',
        is_active: location?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/locations/${location.id}`);
        } else {
            post('/admin/locations');
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${location.name}` : 'Create Location'}
            />
            <FormPage
                title={isEditing ? `Edit ${location.name}` : 'Create Location'}
                backUrl="/admin/locations"
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
                                placeholder="e.g. WH-01"
                            />
                            <InputError message={errors.code} />
                        </div>
                    </div>
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
                                <SelectItem value="store">Store</SelectItem>
                                <SelectItem value="warehouse">
                                    Warehouse
                                </SelectItem>
                                <SelectItem value="pop-up">Pop-up</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="address_line_1">
                                Address Line 1
                            </Label>
                            <Input
                                id="address_line_1"
                                value={data.address_line_1}
                                onChange={(e) =>
                                    setData('address_line_1', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address_line_2">
                                Address Line 2
                            </Label>
                            <Input
                                id="address_line_2"
                                value={data.address_line_2}
                                onChange={(e) =>
                                    setData('address_line_2', e.target.value)
                                }
                            />
                        </div>
                    </div>
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
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="manager_name">Manager Name</Label>
                        <Input
                            id="manager_name"
                            value={data.manager_name}
                            onChange={(e) =>
                                setData('manager_name', e.target.value)
                            }
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', !!v)}
                        />
                        <span className="text-sm">Active</span>
                    </label>
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
