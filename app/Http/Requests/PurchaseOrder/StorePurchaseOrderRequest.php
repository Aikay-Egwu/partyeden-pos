<?php

declare(strict_types=1);

namespace App\Http\Requests\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'po_number' => ['required', 'string', 'max:50', 'unique:purchase_orders,po_number'],
            'supplier_id' => ['required', 'string', 'exists:suppliers,id'],
            'location_id' => ['nullable', 'string', 'exists:locations,id'],
            'status' => ['nullable', 'string', 'in:draft,sent,partially_received,fully_received,cancelled'],
            'order_date' => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
