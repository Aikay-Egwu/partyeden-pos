import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type User = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
} | null;

type Props = {
    user: User;
};

export default function UserForm({ user }: Props) {
    const isEditing = user !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        is_admin: user?.is_admin ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // useForm submits its bound data. On edit, a blank password is sent as
        // '' which Laravel converts to null; the server then leaves the
        // existing password untouched.
        if (isEditing) {
            put(`/admin/users/${user!.id}`);

            return;
        }

        post('/admin/users');
    };

    return (
        <>
            <Head title={isEditing ? `Edit ${user.name}` : 'Add User'} />
            <FormPage
                title={isEditing ? `Edit ${user.name}` : 'Add User'}
                backUrl="/admin/users"
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            {isEditing && (
                                <p className="text-sm text-muted-foreground">
                                    Leave blank to keep the current password.
                                </p>
                            )}
                            <InputError message={errors.password} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={data.is_admin}
                            onCheckedChange={(v) => setData('is_admin', !!v)}
                        />
                        <span className="text-sm">Administrator</span>
                    </label>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update User' : 'Create User'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
