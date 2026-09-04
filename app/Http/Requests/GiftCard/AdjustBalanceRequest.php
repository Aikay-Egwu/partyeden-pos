<?php

declare(strict_types=1);

namespace App\Http\Requests\GiftCard;

use Illuminate\Foundation\Http\FormRequest;

class AdjustBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
