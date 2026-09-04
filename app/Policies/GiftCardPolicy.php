<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\GiftCard;
use App\Models\User;

class GiftCardPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GiftCard $giftCard): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage gift cards');
    }

    public function update(User $user, GiftCard $giftCard): bool
    {
        return $user->can('manage gift cards');
    }

    public function delete(User $user, GiftCard $giftCard): bool
    {
        return $user->can('manage gift cards');
    }
}
