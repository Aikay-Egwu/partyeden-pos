<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\GiftCardTransaction;
use App\Models\User;

class GiftCardTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GiftCardTransaction $giftCardTransaction): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage gift cards');
    }

    public function update(User $user, GiftCardTransaction $giftCardTransaction): bool
    {
        return false;
    }

    public function delete(User $user, GiftCardTransaction $giftCardTransaction): bool
    {
        return false;
    }
}
