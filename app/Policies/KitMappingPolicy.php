<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\KitMapping;
use App\Models\User;

class KitMappingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, KitMapping $kitMapping): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage products');
    }

    public function update(User $user, KitMapping $kitMapping): bool
    {
        return $user->can('manage products');
    }

    public function delete(User $user, KitMapping $kitMapping): bool
    {
        return $user->can('manage products');
    }
}
