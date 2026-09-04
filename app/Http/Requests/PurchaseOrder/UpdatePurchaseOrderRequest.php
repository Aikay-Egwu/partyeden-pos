<?php

declare(strict_types=1);

namespace App\Http\Requests\PurchaseOrder;

use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var PurchaseOrder $purchaseOrder */
        $purchaseOrder = $this->route('purchase_order');

        return [
            'po_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('purchase_orders', 'po_number')->ignore($purchaseOrder->id)],
            'supplier_id' => ['sometimes', 'required', 'string', 'exists:suppliers,id'],
            'location_id' => ['nullable', 'string', 'exists:locations,id'],
            'status' => ['nullable', 'string', 'in:draft,sent,partially_received,fully_received,cancelled'],
            'order_date' => ['sometimes', 'required', 'date'],
            'expected_delivery_date' => ['nullable', 'date'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
