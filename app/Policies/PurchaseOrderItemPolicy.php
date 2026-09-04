<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\PurchaseOrderItem;
use App\Models\User;

class PurchaseOrderItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PurchaseOrderItem $purchaseOrderItem): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage purchasing');
    }

    public function update(User $user, PurchaseOrderItem $purchaseOrderItem): bool
    {
        return $user->can('manage purchasing');
    }

    public function delete(User $user, PurchaseOrderItem $purchaseOrderItem): bool
    {
        return $user->can('manage purchasing');
    }
}
