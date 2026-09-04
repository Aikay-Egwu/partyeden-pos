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

type Shipment = {
    id: string;
    order_id: string;
    tracking_number: string | null;
    carrier: string | null;
    shipping_method: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
    shipping_address: string | null;
    notes: string | null;
    order?: { id: string; order_number: string } | null;
} | null;

type Props = {
    shipment: Shipment;
};

/**
 * Shipment create/edit form page.
 */
export default function ShipmentForm({ shipment }: Props) {
    const isEditing = shipment !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        order_id: shipment?.order_id ?? '',
        tracking_number: shipment?.tracking_number ?? '',
        carrier: shipment?.carrier ?? '',
        shipping_method: shipment?.shipping_method ?? '',
        status: shipment?.status ?? 'pending',
        shipped_at: shipment?.shipped_at
            ? shipment.shipped_at.replace(' ', 'T').slice(0, 16)
            : '',
        delivered_at: shipment?.delivered_at
            ? shipment.delivered_at.replace(' ', 'T').slice(0, 16)
            : '',
        shipping_address: shipment?.shipping_address ?? '',
        notes: shipment?.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/shipments/${shipment.id}`);
        } else {
            post('/admin/shipments');
        }
    };

    return (
        <>
            <Head title={isEditing ? `Edit Shipment` : 'Create Shipment'} />
            <FormPage
                title={
                    isEditing
                        ? `Edit Shipment - ${shipment.order?.order_number ?? ''}`
                        : 'Create Shipment'
                }
                backUrl="/admin/shipments"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order ID */}
                    <div className="space-y-2">
                        <Label htmlFor="order_id">Order ID</Label>
                        <Input
                            id="order_id"
                            value={data.order_id}
                            onChange={(e) =>
                                setData('order_id', e.target.value)
                            }
                            placeholder="Order UUID"
                        />
                        <InputError message={errors.order_id} />
                    </div>

                    {/* Status and Carrier */}
                    <div className="grid gap-4 sm:grid-cols-2">
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
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="shipped">
                                        Shipped
                                    </SelectItem>
                                    <SelectItem value="in_transit">
                                        In Transit
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem value="returned">
                                        Returned
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="carrier">Carrier</Label>
                            <Input
                                id="carrier"
                                value={data.carrier}
                                onChange={(e) =>
                                    setData('carrier', e.target.value)
                                }
                                placeholder="DHL, FedEx, etc."
                            />
                        </div>
                    </div>

                    {/* Tracking and Method */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="tracking_number">
                                Tracking Number
                            </Label>
                            <Input
                                id="tracking_number"
                                value={data.tracking_number}
                                onChange={(e) =>
                                    setData('tracking_number', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shipping_method">
                                Shipping Method
                            </Label>
                            <Input
                                id="shipping_method"
                                value={data.shipping_method}
                                onChange={(e) =>
                                    setData('shipping_method', e.target.value)
                                }
                                placeholder="Standard, Express..."
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="shipped_at">Shipped At</Label>
                            <Input
                                id="shipped_at"
                                type="datetime-local"
                                value={data.shipped_at}
                                onChange={(e) =>
                                    setData('shipped_at', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivered_at">Delivered At</Label>
                            <Input
                                id="delivered_at"
                                type="datetime-local"
                                value={data.delivered_at}
                                onChange={(e) =>
                                    setData('delivered_at', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="shipping_address">
                            Shipping Address
                        </Label>
                        <textarea
                            id="shipping_address"
                            className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.shipping_address}
                            onChange={(e) =>
                                setData('shipping_address', e.target.value)
                            }
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Shipment' : 'Create Shipment'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
