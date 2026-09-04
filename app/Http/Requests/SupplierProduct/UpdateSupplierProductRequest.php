<?php

declare(strict_types=1);

namespace App\Http\Requests\SupplierProduct;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_sku' => ['nullable', 'string', 'max:100'],
            'cost_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'min_order_qty' => ['nullable', 'numeric', 'min:0.0001'],
            'is_preferred' => ['nullable', 'boolean'],
        ];
    }
}
