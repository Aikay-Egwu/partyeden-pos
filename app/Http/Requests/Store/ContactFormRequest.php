<?php

declare(strict_types=1);

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Validates the public contact form submission.
 * Includes honeypot and timing checks to prevent spam bots.
 */
class ContactFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'event_type' => ['required', 'string', 'max:255'],
            'event_date' => ['nullable', 'date', 'after_or_equal:today'],
            'message' => ['required', 'string', 'max:5000'],
            // Honeypot: must be empty — bots fill hidden fields
            'website_url' => ['nullable', 'string', 'max:0'],
            // Timing: form must have been open for at least 3 seconds
            'form_loaded_at' => ['nullable', 'numeric'],
        ];
    }

    /**
     * Run additional validation after the standard rules pass.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            // Timing check: reject if form was submitted too quickly (< 3 seconds)
            if ($this->filled('form_loaded_at')) {
                $elapsed = time() - (int) $this->input('form_loaded_at');
                if ($elapsed < 3) {
                    $v->errors()->add('message', 'Please wait a moment before submitting.');
                }
            }
        });
    }
}
