<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\SupplierProduct;
use App\Models\User;

class SupplierProductPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SupplierProduct $supplierProduct): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage purchasing');
    }

    public function update(User $user, SupplierProduct $supplierProduct): bool
    {
        return $user->can('manage purchasing');
    }

    public function delete(User $user, SupplierProduct $supplierProduct): bool
    {
        return $user->can('manage purchasing');
    }
}
