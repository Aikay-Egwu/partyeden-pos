<?php

declare(strict_types=1);

namespace App\Http\Requests\KitMapping;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKitMappingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['sometimes', 'uuid', 'exists:products,id'],
            'variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
            'quantity' => ['sometimes', 'numeric', 'min:0.0001'],
        ];
    }
}
