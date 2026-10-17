<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'order_source' => ['required', 'string', 'in:phone,whatsapp'],
            'fulfillment_type' => ['required', 'string', 'in:pickup,delivery'],
            'expected_at' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'delivery_postcode' => ['nullable', 'required_if:fulfillment_type,delivery', 'string', 'max:20'],
            'shipping_address_line1' => ['nullable', 'required_if:fulfillment_type,delivery', 'string', 'max:255'],
            'shipping_address_line2' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['nullable', 'required_if:fulfillment_type,delivery', 'string', 'max:100'],
            'shipping_amount' => ['nullable', 'numeric', 'min:0'],
            'customer' => ['required', 'array'],
            'customer.first_name' => ['required', 'string', 'max:100'],
            'customer.last_name' => ['required', 'string', 'max:100'],
            'customer.phone' => ['nullable', 'string', 'max:50'],
            'customer.email' => ['nullable', 'email', 'max:255'],
            'send_link_via' => ['nullable', 'string', 'in:email,copy,none'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'uuid', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.customization_text' => ['nullable', 'string', 'max:500'],
            'items.*.customization_font' => ['nullable', 'string', 'max:100'],
            'items.*.customization_primary_color_id' => ['nullable', 'integer', 'exists:colors,id'],
            'items.*.customization_secondary_color_id' => ['nullable', 'integer', 'exists:colors,id'],
            'items.*.instructions' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
