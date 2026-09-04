<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\AttributeValue;
use App\Models\User;

class AttributeValuePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, AttributeValue $attributeValue): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage products');
    }

    public function update(User $user, AttributeValue $attributeValue): bool
    {
        return $user->can('manage products');
    }

    public function delete(User $user, AttributeValue $attributeValue): bool
    {
        return $user->can('manage products');
    }
}
