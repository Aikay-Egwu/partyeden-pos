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

// Form field shapes
type PurchaseOrder = {
    id: string;
    po_number: string;
    supplier_id: string;
    location_id: string | null;
    status: string;
    order_date: string;
    expected_delivery_date: string | null;
    total_amount: string;
    currency: string;
    notes: string | null;
} | null;

type Option = { id: string; name: string };

type Props = {
    purchaseOrder: PurchaseOrder;
    suppliers: Option[];
    locations: Option[];
};

/**
 * Purchase Order create/edit form page.
 */
export default function PurchaseOrderForm({
    purchaseOrder,
    suppliers,
    locations,
}: Props) {
    const isEditing = purchaseOrder !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        po_number: purchaseOrder?.po_number ?? '',
        supplier_id: purchaseOrder?.supplier_id ?? '',
        location_id: purchaseOrder?.location_id ?? '',
        status: purchaseOrder?.status ?? 'draft',
        order_date:
            purchaseOrder?.order_date ?? new Date().toISOString().split('T')[0],
        expected_delivery_date: purchaseOrder?.expected_delivery_date ?? '',
        total_amount: purchaseOrder?.total_amount ?? '0',
        currency: purchaseOrder?.currency ?? 'GBP',
        notes: purchaseOrder?.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/purchase-orders/${purchaseOrder.id}`);
        } else {
            post('/admin/purchase-orders');
        }
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Edit ${purchaseOrder.po_number}`
                        : 'Create Purchase Order'
                }
            />
            <FormPage
                title={
                    isEditing
                        ? `Edit ${purchaseOrder.po_number}`
                        : 'Create Purchase Order'
                }
                backUrl="/admin/purchase-orders"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* PO Number and Status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number</Label>
                            <Input
                                id="po_number"
                                value={data.po_number}
                                onChange={(e) =>
                                    setData('po_number', e.target.value)
                                }
                                placeholder="PO-001"
                            />
                            <InputError message={errors.po_number} />
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
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="partial">
                                        Partial
                                    </SelectItem>
                                    <SelectItem value="received">
                                        Received
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Supplier and Location */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Select
                                value={data.supplier_id}
                                onValueChange={(v) => setData('supplier_id', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.supplier_id} />
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
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="order_date">Order Date</Label>
                            <Input
                                id="order_date"
                                type="date"
                                value={data.order_date}
                                onChange={(e) =>
                                    setData('order_date', e.target.value)
                                }
                            />
                            <InputError message={errors.order_date} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expected_delivery_date">
                                Expected Delivery
                            </Label>
                            <Input
                                id="expected_delivery_date"
                                type="date"
                                value={data.expected_delivery_date}
                                onChange={(e) =>
                                    setData(
                                        'expected_delivery_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* Total and Currency */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="total_amount">Total Amount</Label>
                            <Input
                                id="total_amount"
                                type="number"
                                step="0.01"
                                value={data.total_amount}
                                onChange={(e) =>
                                    setData('total_amount', e.target.value)
                                }
                            />
                            <InputError message={errors.total_amount} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                value={data.currency}
                                onChange={(e) =>
                                    setData('currency', e.target.value)
                                }
                                placeholder="GBP"
                                maxLength={3}
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
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {isEditing
                            ? 'Update Purchase Order'
                            : 'Create Purchase Order'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}
