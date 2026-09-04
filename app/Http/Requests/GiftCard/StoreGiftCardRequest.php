<?php

declare(strict_types=1);

namespace App\Http\Requests\GiftCard;

use Illuminate\Foundation\Http\FormRequest;

class StoreGiftCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'original_amount' => ['required', 'numeric', 'min:0.01'],
            'customer_id' => ['nullable', 'string', 'exists:customers,id'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'recipient_email' => ['nullable', 'email', 'max:255'],
            'message' => ['nullable', 'string', 'max:1000'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ];
    }
}
