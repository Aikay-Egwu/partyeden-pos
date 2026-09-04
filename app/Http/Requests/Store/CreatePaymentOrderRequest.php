<?php

declare(strict_types=1);

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the initial PayPal order creation for the current cart.
 */
class CreatePaymentOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'email' => 'nullable|email|max:255',
            'fulfillment_type' => 'required|string|in:pickup,delivery',
            'delivery_postcode' => 'nullable|string|max:20',
            'loyalty_points' => 'nullable|numeric|min:0',
        ];
    }
}
