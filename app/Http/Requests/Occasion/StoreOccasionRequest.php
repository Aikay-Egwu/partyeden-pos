<?php

declare(strict_types=1);

namespace App\Http\Requests\Occasion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreOccasionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:occasions,slug'],
            'description' => ['nullable', 'string', 'max:3000'],
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_text' => ['nullable', 'string', 'max:3000'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'product_ids' => ['array'],
            'product_ids.*' => ['uuid', 'exists:products,id'],
        ];
    }

    protected function passedValidation(): void
    {
        if (empty($this->validated()['slug'])) {
            $this->merge(['slug' => Str::slug((string) $this->input('name'))]);
        }
    }
}
