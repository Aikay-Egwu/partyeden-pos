<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\OrderItem;
use App\Models\User;

class OrderItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, OrderItem $orderItem): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage orders');
    }

    public function update(User $user, OrderItem $orderItem): bool
    {
        return $user->can('manage orders');
    }

    public function delete(User $user, OrderItem $orderItem): bool
    {
        return $user->can('manage orders');
    }
}
