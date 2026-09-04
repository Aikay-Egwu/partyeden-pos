<?php

declare(strict_types=1);

namespace App\Http\Requests\Variant;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'sku' => ['sometimes', 'nullable', 'string', 'max:100'],
            'barcode' => ['nullable', 'string', 'max:100', 'unique:variants,barcode'],
            'name' => ['required', 'string', 'max:255'],
            'price_adjustment' => ['sometimes', 'numeric'],
            'cost_price_adjustment' => ['sometimes', 'numeric'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
