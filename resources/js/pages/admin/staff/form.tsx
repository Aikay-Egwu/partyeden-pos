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

type StaffMember = {
    id: string;
    user_id: string | null;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    role: string;
    employee_code: string | null;
    hourly_rate: string | null;
    hire_date: string | null;
    termination_date: string | null;
    is_active: boolean;
} | null;

type Props = {
    staffMember: StaffMember;
};

/**
 * Staff create/edit form page.
 */
export default function StaffForm({ staffMember }: Props) {
    const isEditing = staffMember !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        first_name: staffMember?.first_name ?? '',
        last_name: staffMember?.last_name ?? '',
        email: staffMember?.email ?? '',
        phone: staffMember?.phone ?? '',
        role: staffMember?.role ?? 'cashier',
        employee_code: staffMember?.employee_code ?? '',
        hourly_rate: staffMember?.hourly_rate ?? '',
        hire_date: staffMember?.hire_date ?? '',
        termination_date: staffMember?.termination_date ?? '',
        is_active: staffMember?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/staff/${staffMember.id}`);
        } else {
            post('/admin/staff');
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Edit ${staffMember.first_name} ${staffMember.last_name}`
                        : 'Create Staff Member'
                }
            />
            <FormPage
                title={
                    isEditing
                        ? `Edit ${staffMember.first_name} ${staffMember.last_name}`
                        : 'Create Staff Member'
                }
                backUrl="/admin/staff"
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
                            />
                        </div>
                    </div>

                    {/* Role and Employee Code */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(v) => setData('role', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="manager">
                                        Manager
                                    </SelectItem>
                                    <SelectItem value="cashier">
                                        Cashier
                                    </SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employee_code">Employee Code</Label>
                            <Input
                                id="employee_code"
                                value={data.employee_code}
                                onChange={(e) =>
                                    setData('employee_code', e.target.value)
                                }
                                placeholder="EMP-001"
                            />
                            <InputError message={errors.employee_code} />
                        </div>
                    </div>

                    {/* Hourly Rate and Hire Date */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="hourly_rate">Hourly Rate</Label>
                            <Input
                                id="hourly_rate"
                                type="number"
                                step="0.01"
                                value={data.hourly_rate}
                                onChange={(e) =>
                                    setData('hourly_rate', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hire_date">Hire Date</Label>
                            <Input
                                id="hire_date"
                                type="date"
                                value={data.hire_date}
                                onChange={(e) =>
                                    setData('hire_date', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Termination Date */}
                    <div className="space-y-2">
                        <Label htmlFor="termination_date">
                            Termination Date
                        </Label>
                        <Input
                            id="termination_date"
                            type="date"
                            value={data.termination_date}
                            onChange={(e) =>
                                setData('termination_date', e.target.value)
                            }
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
                        {isEditing
                            ? 'Update Staff Member'
                            : 'Create Staff Member'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
