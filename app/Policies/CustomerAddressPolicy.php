<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CustomerAddress;
use App\Models\User;

class CustomerAddressPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CustomerAddress $customerAddress): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage customers');
    }

    public function update(User $user, CustomerAddress $customerAddress): bool
    {
        return $user->can('manage customers');
    }

    public function delete(User $user, CustomerAddress $customerAddress): bool
    {
        return $user->can('manage customers');
    }
}
