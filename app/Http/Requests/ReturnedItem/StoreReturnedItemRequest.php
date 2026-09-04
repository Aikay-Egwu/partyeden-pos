<?php

declare(strict_types=1);

namespace App\Http\Requests\ReturnedItem;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnedItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:variants,id'],
            'quantity' => ['required', 'numeric', 'min:0.0001'],
            'refund_amount' => ['required', 'numeric', 'min:0'],
            'condition' => ['required', 'string', 'in:good,damaged,defective'],
            'disposition' => ['required', 'string', 'in:return_to_stock,write_off,return_to_supplier'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
