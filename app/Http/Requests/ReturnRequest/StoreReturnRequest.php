<?php

declare(strict_types=1);

namespace App\Http\Requests\ReturnRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_id' => ['required', 'exists:transactions,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'staff_id' => ['required', 'exists:staff,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'total_refund' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
