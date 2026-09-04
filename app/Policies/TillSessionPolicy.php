<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TillSession;
use App\Models\User;

class TillSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TillSession $tillSession): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('process sales');
    }

    public function update(User $user, TillSession $tillSession): bool
    {
        return $user->can('process sales');
    }
}
