<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Attribute;
use App\Models\User;

class AttributePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Attribute $attribute): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage products');
    }

    public function update(User $user, Attribute $attribute): bool
    {
        return $user->can('manage products');
    }

    public function delete(User $user, Attribute $attribute): bool
    {
        return $user->can('manage products');
    }
}
