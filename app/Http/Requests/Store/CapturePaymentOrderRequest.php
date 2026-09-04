<?php

declare(strict_types=1);

namespace App\Http\Requests\Store;

/**
 * Validates the PayPal capture step — the same checkout details as
 * placing an order, plus the PayPal order to capture.
 */
class CapturePaymentOrderRequest extends PlaceOrderRequest
{
    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'paypalOrderId' => 'required|string|max:255',
            ...parent::rules(),
        ];
    }
}
