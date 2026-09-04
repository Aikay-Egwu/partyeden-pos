<?php

declare(strict_types=1);

namespace App\Http\Requests\Occasion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateOccasionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $occasionId = $this->route('occasion')->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('occasions', 'slug')->ignore($occasionId)],
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
        if ($this->has('name') && ! $this->has('slug')) {
            $this->merge(['slug' => Str::slug((string) $this->input('name'))]);
        }
    }
}
