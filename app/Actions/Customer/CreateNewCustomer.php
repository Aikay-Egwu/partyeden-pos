<?php

declare(strict_types=1);

namespace App\Actions\Customer;

use App\Concerns\PasswordValidationRules;
use App\Models\Customer;
use Illuminate\Support\Facades\Validator;

class CreateNewCustomer
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered customer.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): Customer
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:customers,email'],
            'password' => $this->passwordRules(),
            'phone' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'company_name' => ['nullable', 'string', 'max:255'],
        ])->validate();

        $customer = Customer::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'phone' => $input['phone'] ?? null,
            'date_of_birth' => $input['date_of_birth'] ?? null,
            'company_name' => $input['company_name'] ?? null,
            'is_active' => true,
            'email_verified_at' => null,
        ]);

        // Send the verification email so the customer must confirm their
        // address before they are allowed to log in.
        $customer->sendEmailVerificationNotification();

        return $customer;
    }
}
