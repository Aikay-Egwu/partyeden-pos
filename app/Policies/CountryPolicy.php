<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Country;
use App\Models\User;

class CountryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Country $country): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage settings');
    }

    public function update(User $user, Country $country): bool
    {
        return $user->can('manage settings');
    }

    public function delete(User $user, Country $country): bool
    {
        return $user->can('manage settings');
    }
}
