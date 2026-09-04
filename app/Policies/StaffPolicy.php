<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Staff;
use App\Models\User;

class StaffPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Staff $staff): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage staff');
    }

    public function update(User $user, Staff $staff): bool
    {
        return $user->can('manage staff');
    }

    public function delete(User $user, Staff $staff): bool
    {
        return $user->can('manage staff');
    }
}
