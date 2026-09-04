<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\LoyaltyAccount;
use App\Models\User;

class LoyaltyAccountPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, LoyaltyAccount $loyaltyAccount): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage customers');
    }

    public function update(User $user, LoyaltyAccount $loyaltyAccount): bool
    {
        return $user->can('manage loyalty');
    }

    public function delete(User $user, LoyaltyAccount $loyaltyAccount): bool
    {
        return false;
    }
}
