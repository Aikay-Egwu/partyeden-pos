<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InventoryBalance;
use App\Models\User;

class InventoryBalancePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InventoryBalance $inventoryBalance): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage inventory');
    }

    public function update(User $user, InventoryBalance $inventoryBalance): bool
    {
        return $user->can('manage inventory');
    }

    public function delete(User $user, InventoryBalance $inventoryBalance): bool
    {
        return false;
    }
}
