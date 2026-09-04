<?php

declare(strict_types=1);

namespace App\Http\Requests\TillSession;

use Illuminate\Foundation\Http\FormRequest;

class OpenTillSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'staff_id' => ['required', 'exists:staff,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
        ];
    }
}
