<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\LoyaltyTransaction;
use App\Models\User;

class LoyaltyTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, LoyaltyTransaction $loyaltyTransaction): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage loyalty');
    }

    public function update(User $user, LoyaltyTransaction $loyaltyTransaction): bool
    {
        return false;
    }

    public function delete(User $user, LoyaltyTransaction $loyaltyTransaction): bool
    {
        return false;
    }
}
