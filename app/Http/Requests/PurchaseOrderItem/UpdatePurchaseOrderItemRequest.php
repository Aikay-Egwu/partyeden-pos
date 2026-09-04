<?php

declare(strict_types=1);

namespace App\Http\Requests\PurchaseOrderItem;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['sometimes', 'required', 'string', 'exists:products,id'],
            'variant_id' => ['nullable', 'string', 'exists:variants,id'],
            'quantity' => ['sometimes', 'required', 'numeric', 'min:0.0001'],
            'unit_cost' => ['sometimes', 'required', 'numeric', 'min:0'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
