<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReturnedItem;
use App\Models\User;

class ReturnedItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ReturnedItem $returnedItem): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage returns');
    }

    public function update(User $user, ReturnedItem $returnedItem): bool
    {
        return $user->can('manage returns');
    }

    public function delete(User $user, ReturnedItem $returnedItem): bool
    {
        return $user->can('manage returns');
    }
}
