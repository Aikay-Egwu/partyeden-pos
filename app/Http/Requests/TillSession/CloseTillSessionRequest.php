<?php

declare(strict_types=1);

namespace App\Http\Requests\TillSession;

use Illuminate\Foundation\Http\FormRequest;

class CloseTillSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'closing_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
