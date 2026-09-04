<?php

declare(strict_types=1);

namespace App\Http\Requests\GiftCard;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGiftCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:active,cancelled'],
        ];
    }
}
