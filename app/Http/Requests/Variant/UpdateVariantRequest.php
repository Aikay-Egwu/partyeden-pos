<?php

declare(strict_types=1);

namespace App\Http\Requests\Variant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['sometimes', 'nullable', 'string', 'max:100'],
            'barcode' => ['nullable', 'string', 'max:100', Rule::unique('variants', 'barcode')->ignore($this->route('variant')->id)],
            'name' => ['sometimes', 'string', 'max:255'],
            'price_adjustment' => ['sometimes', 'numeric'],
            'cost_price_adjustment' => ['sometimes', 'numeric'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
