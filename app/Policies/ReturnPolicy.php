<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReturnModel;
use App\Models\User;

class ReturnPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ReturnModel $return): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage returns');
    }

    public function update(User $user, ReturnModel $return): bool
    {
        return $user->can('manage returns');
    }

    public function delete(User $user, ReturnModel $return): bool
    {
        return $user->can('manage returns');
    }
}
