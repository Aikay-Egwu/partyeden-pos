<?php

declare(strict_types=1);

namespace App\Http\Requests\KitMapping;

use Illuminate\Foundation\Http\FormRequest;

class StoreKitMappingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kit_product_id' => ['required', 'uuid', 'exists:products,id'],
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
            'quantity' => ['required', 'numeric', 'min:0.0001'],
        ];
    }
}
