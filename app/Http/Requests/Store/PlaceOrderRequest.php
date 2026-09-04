<?php

declare(strict_types=1);

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates customer/checkout details when placing an order from the cart.
 */
class PlaceOrderRequest extends FormRequest
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'fulfillment_type' => 'required|string|in:pickup,delivery',
            'delivery_postcode' => 'nullable|string|max:20',
            // Structured delivery address (required for delivery orders)
            'address_line1' => 'required_if:fulfillment_type,delivery|nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required_if:fulfillment_type,delivery|nullable|string|max:255',
            'loyalty_points' => 'nullable|numeric|min:0',
        ];
    }
}
