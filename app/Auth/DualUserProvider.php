<?php

declare(strict_types=1);

namespace App\Auth;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Hashing\Hasher as HasherContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Custom dual-model user provider that authenticates against both
 * the admin User table (int IDs) and the Customer table (UUIDs).
 *
 * Admin users take priority when retrieving by credentials: if an
 * email exists in both tables, the User (admin) record wins.
 */
class DualUserProvider implements UserProvider
{
    /**
     * The hasher implementation.
     */
    protected HasherContract $hasher;

    /**
     * Create a new dual user provider instance.
     */
    public function __construct(HasherContract $hasher)
    {
        $this->hasher = $hasher;
    }

    /**
     * Retrieve a user by their unique identifier (int for User, string UUID for Customer).
     *
     * @param  mixed  $identifier
     */
    public function retrieveById($identifier): ?AuthenticatableContract
    {
        if (is_numeric($identifier)) {
            /** @var User|null $user */
            $user = User::query()->whereKey((int) $identifier)->first();

            return $user;
        }

        /** @var Customer|null $customer */
        $customer = Customer::query()->whereKey((string) $identifier)->first();

        return $customer;
    }

    /**
     * Retrieve a user by their unique identifier and "remember me" token.
     *
     * @param  mixed  $identifier
     * @param  string  $token
     */
    public function retrieveByToken($identifier, $token): ?AuthenticatableContract
    {
        $model = $this->retrieveById($identifier);

        if ($model === null) {
            return null;
        }

        $rememberToken = $model->getRememberToken();

        return $rememberToken && hash_equals($rememberToken, $token)
            ? $model
            : null;
    }

    /**
     * Update the "remember me" token in storage for the given user.
     *
     * @param  string  $token
     */
    public function updateRememberToken(AuthenticatableContract $user, $token): void
    {
        assert($user instanceof Model);

        $user->setRememberToken($token);
        $user->timestamps = false;
        $user->save();
    }

    /**
     * Retrieve a user by the given credentials.
     *
     * Tries the admin User table first, then falls back to Customer.
     *
     * @param  array<string, mixed>  $credentials
     */
    public function retrieveByCredentials(array $credentials): ?AuthenticatableContract
    {
        $credentials = collect($credentials)->except(['password', 'remember_token'])->all();

        if (empty($credentials)) {
            return null;
        }

        // Try admin User first (priority per sequential lookup requirement).
        $query = User::query();

        foreach ($credentials as $key => $value) {
            if (Str::contains($key, 'password')) {
                continue;
            }

            $query->where($key, $value);
        }

        $user = $query->first();

        if ($user !== null) {
            return $user;
        }

        // Fall back to Customer.
        $customerQuery = Customer::query();

        foreach ($credentials as $key => $value) {
            if (Str::contains($key, 'password')) {
                continue;
            }

            $customerQuery->where($key, $value);
        }

        return $customerQuery->first();
    }

    /**
     * Validate a user against the given credentials.
     *
     * @param  array<string, mixed>  $credentials
     */
    public function validateCredentials(AuthenticatableContract $user, array $credentials): bool
    {
        $plain = $credentials['password'];

        return $this->hasher->check($plain, $user->getAuthPassword());
    }

    /**
     * Rehash the user's password if required (newer hashing algorithm available).
     *
     * @param  array<string, mixed>  $credentials
     */
    public function rehashPasswordIfRequired(AuthenticatableContract $user, #[\SensitiveParameter] array $credentials, bool $force = false): void
    {
        if (! $this->hasher->needsRehash($user->getAuthPassword()) && ! $force) {
            return;
        }

        assert($user instanceof Model);

        $user->forceFill([
            $user->getAuthPasswordName() => $this->hasher->make($credentials['password']),
        ])->save();
    }

    /**
     * Return the Eloquent model class for "admin-style" features that require a
     * single concrete FQCN (Fortify 2FA challenge helpers, PasswordBroker helpers,
     * etc.). Only admin Users have 2FA/passkeys; customers use basic auth only.
     *
     * @return class-string<User>
     */
    public function getModel(): string
    {
        return User::class;
    }
}
