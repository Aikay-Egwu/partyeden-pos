<?php

declare(strict_types=1);

namespace App\Http\Requests\PriceHistory;

use Illuminate\Foundation\Http\FormRequest;

class StorePriceHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
            'new_price' => ['required', 'numeric', 'min:0'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
