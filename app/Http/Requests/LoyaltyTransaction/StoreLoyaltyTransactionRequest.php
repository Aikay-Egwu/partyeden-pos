<?php

declare(strict_types=1);

namespace App\Http\Requests\LoyaltyTransaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoyaltyTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:earn,redeem,adjust,expire'],
            'points' => ['required', 'numeric'],
            'description' => ['nullable', 'string', 'max:500'],
            'transaction_id' => ['nullable', 'string', 'exists:transactions,id'],
        ];
    }
}
