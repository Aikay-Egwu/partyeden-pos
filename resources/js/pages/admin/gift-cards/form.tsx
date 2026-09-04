import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type GiftCard = {
    id: string;
    code: string;
    original_amount: string;
    current_balance: string;
    status: string;
    customer_id: string | null;
    recipient_name: string | null;
    recipient_email: string | null;
    message: string | null;
    issued_at: string | null;
    expires_at: string | null;
} | null;

type CustomerOption = { id: string; first_name: string; last_name: string };

type Props = {
    giftCard: GiftCard;
    customers: CustomerOption[];
};

/**
 * Gift Card create/edit form page.
 */
export default function GiftCardForm({ giftCard, customers }: Props) {
    const isEditing = giftCard !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        code: giftCard?.code ?? '',
        original_amount: giftCard?.original_amount ?? '0',
        current_balance: giftCard?.current_balance ?? '0',
        status: giftCard?.status ?? 'active',
        customer_id: giftCard?.customer_id ?? '',
        recipient_name: giftCard?.recipient_name ?? '',
        recipient_email: giftCard?.recipient_email ?? '',
        message: giftCard?.message ?? '',
        issued_at: giftCard?.issued_at
            ? giftCard.issued_at.replace(' ', 'T').slice(0, 16)
            : '',
        expires_at: giftCard?.expires_at
            ? giftCard.expires_at.replace(' ', 'T').slice(0, 16)
            : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/gift-cards/${giftCard.id}`);
        } else {
            post('/admin/gift-cards');
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${giftCard.code}` : 'Create Gift Card'}
            />
            <FormPage
                title={isEditing ? `Edit ${giftCard.code}` : 'Create Gift Card'}
                backUrl="/admin/gift-cards"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Code and Status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder="GC-XXXX-XXXX"
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(v) => setData('status', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="depleted">
                                        Depleted
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Expired
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Amounts */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="original_amount">
                                Original Amount
                            </Label>
                            <Input
                                id="original_amount"
                                type="number"
                                step="0.01"
                                value={data.original_amount}
                                onChange={(e) =>
                                    setData('original_amount', e.target.value)
                                }
                            />
                            <InputError message={errors.original_amount} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current_balance">
                                Current Balance
                            </Label>
                            <Input
                                id="current_balance"
                                type="number"
                                step="0.01"
                                value={data.current_balance}
                                onChange={(e) =>
                                    setData('current_balance', e.target.value)
                                }
                            />
                            <InputError message={errors.current_balance} />
                        </div>
                    </div>

                    {/* Customer dropdown */}
                    <div className="space-y-2">
                        <Label>Linked Customer</Label>
                        <Select
                            value={data.customer_id}
                            onValueChange={(v) => setData('customer_id', v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Optional - link to customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.first_name} {c.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Recipient info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="recipient_name">
                                Recipient Name
                            </Label>
                            <Input
                                id="recipient_name"
                                value={data.recipient_name}
                                onChange={(e) =>
                                    setData('recipient_name', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipient_email">
                                Recipient Email
                            </Label>
                            <Input
                                id="recipient_email"
                                type="email"
                                value={data.recipient_email}
                                onChange={(e) =>
                                    setData('recipient_email', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="issued_at">Issued At</Label>
                            <Input
                                id="issued_at"
                                type="datetime-local"
                                value={data.issued_at}
                                onChange={(e) =>
                                    setData('issued_at', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expires_at">Expires At</Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={data.expires_at}
                                onChange={(e) =>
                                    setData('expires_at', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea
                            id="message"
                            className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Optional gift message"
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Gift Card' : 'Create Gift Card'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
