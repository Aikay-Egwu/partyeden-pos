<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage purchasing');
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->can('manage purchasing');
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->can('manage purchasing');
    }
}
