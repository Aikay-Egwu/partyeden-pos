<?php

declare(strict_types=1);

namespace App\Http\Requests\ReturnRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', 'string', 'in:pending,approved,completed,rejected'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'total_refund' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'processed_at' => ['nullable', 'date'],
        ];
    }
}
