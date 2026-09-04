<?php

declare(strict_types=1);

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $staff = $this->route('staff');

        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('staff', 'email')->ignore($staff->id)],
            'phone' => ['nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'required', 'string', 'in:admin,manager,cashier,staff'],
            'employee_code' => ['nullable', 'string', 'max:255', Rule::unique('staff', 'employee_code')->ignore($staff->id)],
            'pin' => ['nullable', 'string', 'max:10'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'hire_date' => ['nullable', 'date'],
            'termination_date' => ['nullable', 'date', 'after_or_equal:hire_date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
