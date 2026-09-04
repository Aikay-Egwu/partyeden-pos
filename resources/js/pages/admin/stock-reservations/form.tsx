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

type Reservation = {
    id: string;
    product_id: string;
    location_id: string;
    quantity: string;
    expires_at?: string;
} | null;
type Props = {
    reservation: Reservation;
    products: { id: string; name: string; sku: string }[];
    locations: { id: string; name: string }[];
};

export default function StockReservationForm({
    reservation,
    products,
    locations,
}: Props) {
    const isEditing = reservation !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        product_id: reservation?.product_id ?? '',
        location_id: reservation?.location_id ?? '',
        quantity: reservation?.quantity ?? '1',
        expires_at: reservation?.expires_at ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/stock-reservations/${reservation.id}`);
        } else {
            post('/admin/stock-reservations');
        }
    };

    return (
        <>
            <Head
                title={isEditing ? 'Edit Reservation' : 'Create Reservation'}
            />
            <FormPage
                title={isEditing ? 'Edit Reservation' : 'Create Reservation'}
                backUrl="/admin/stock-reservations"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Product</Label>
                        <Select
                            value={data.product_id}
                            onValueChange={(v) => setData('product_id', v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} ({p.sku})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.product_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                            value={data.location_id}
                            onValueChange={(v) => setData('location_id', v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((l) => (
                                    <SelectItem key={l.id} value={l.id}>
                                        {l.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.location_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
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
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
