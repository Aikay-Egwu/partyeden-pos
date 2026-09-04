<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TaxCategory;
use App\Models\User;

class TaxCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TaxCategory $taxCategory): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage tax categories');
    }

    public function update(User $user, TaxCategory $taxCategory): bool
    {
        return $user->can('manage tax categories');
    }

    public function delete(User $user, TaxCategory $taxCategory): bool
    {
        return $user->can('manage tax categories');
    }
}
