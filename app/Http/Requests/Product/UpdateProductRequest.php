<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')->id;

        return [
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'barcode' => ['nullable', 'string', 'max:100', Rule::unique('products', 'barcode')->ignore($productId)],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['nullable', 'string', 'max:5000'],
            'category_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'tax_category_id' => ['nullable', 'uuid', 'exists:tax_categories,id'],
            'cost_price' => ['sometimes', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'numeric', 'min:0'],
            'product_type' => ['sometimes', 'string', 'in:standard,kit,service'],
            'is_active' => ['sometimes', 'boolean'],
            'track_inventory' => ['sometimes', 'boolean'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'customise_color' => ['sometimes', 'boolean'],
            'customise_text' => ['sometimes', 'boolean'],
            'preorder' => ['sometimes', 'boolean'],
            'is_online_visible' => ['sometimes', 'boolean'],
            'best_seller_enabled' => ['sometimes', 'boolean'],
            'best_seller_rank' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
