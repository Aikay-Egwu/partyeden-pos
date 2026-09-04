<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ProductImage;
use App\Models\User;

class ProductImagePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProductImage $productImage): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage products');
    }

    public function update(User $user, ProductImage $productImage): bool
    {
        return $user->can('manage products');
    }

    public function delete(User $user, ProductImage $productImage): bool
    {
        return $user->can('manage products');
    }
}
