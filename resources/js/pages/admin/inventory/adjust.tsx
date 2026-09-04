import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Balance = {
    id: string;
    quantity: string;
    product: { name: string };
    location: { name: string };
};
type Props = { balance: Balance };

export default function InventoryAdjust({ balance }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        quantity: balance.quantity,
        reason: '',
    });

    return (
        <>
            <Head title="Adjust Inventory" />
            <FormPage
                title={`Adjust: ${balance.product.name} @ ${balance.location.name}`}
                backUrl="/admin/inventory"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post(`/admin/inventory/${balance.id}/adjust`);
                    }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="quantity">New Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            value={data.quantity}
                            onChange={(e) =>
                                setData('quantity', e.target.value)
                            }
                        />
                        <InputError message={errors.quantity} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="e.g. Stock take correction"
                        />
                        <InputError message={errors.reason} />
                    </div>
                    <Button type="submit" disabled={processing}>
                        Save Adjustment
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
