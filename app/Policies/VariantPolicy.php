<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Variant;

class VariantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Variant $variant): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage products');
    }

    public function update(User $user, Variant $variant): bool
    {
        return $user->can('manage products');
    }

    public function delete(User $user, Variant $variant): bool
    {
        return $user->can('manage products');
    }
}
