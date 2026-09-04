<?php

declare(strict_types=1);

namespace App\Http\Requests\VariantAttribute;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id' => ['required', 'string', 'exists:variants,id'],
            'attribute_value_id' => ['required', 'string', 'exists:attribute_values,id'],
        ];
    }
}
