<?php

declare(strict_types=1);

namespace App\Http\Requests\StockReservation;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'string', 'exists:products,id'],
            'variant_id' => ['nullable', 'string', 'exists:variants,id'],
            'location_id' => ['required', 'string', 'exists:locations,id'],
            'quantity' => ['required', 'numeric', 'min:0.0001'],
            'order_id' => ['nullable', 'string', 'exists:orders,id'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}
