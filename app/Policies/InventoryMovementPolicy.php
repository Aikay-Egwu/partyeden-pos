<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InventoryMovement;
use App\Models\User;

class InventoryMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InventoryMovement $inventoryMovement): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage inventory');
    }

    public function update(User $user, InventoryMovement $inventoryMovement): bool
    {
        return false;
    }

    public function delete(User $user, InventoryMovement $inventoryMovement): bool
    {
        return false;
    }
}
