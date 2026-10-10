<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * Default test password (plain text). Tests authenticate with this value.
     */
    public const DEFAULT_PASSWORD = 'password';

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            // Pre-hashed default password. Tests authenticate using the plain
            // literal 'password'. The model's 'hashed' cast detects an already-
            // hashed value and skips re-hashing via password_needs_rehash.
            'password' => Hash::make(self::DEFAULT_PASSWORD),
            // Remember token: randomly null half the time to reflect real
            // session lifecycle.
            'remember_token' => $this->faker->optional(0.5)->sha1(),
            'phone' => $this->faker->phoneNumber(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the customer's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
