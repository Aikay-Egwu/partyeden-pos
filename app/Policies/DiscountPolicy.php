<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Discount;
use App\Models\User;

class DiscountPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Discount $discount): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage discounts');
    }

    public function update(User $user, Discount $discount): bool
    {
        return $user->can('manage discounts');
    }

    public function delete(User $user, Discount $discount): bool
    {
        return $user->can('manage discounts');
    }
}
