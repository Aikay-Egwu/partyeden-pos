<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\StockReservation;
use App\Models\User;

class StockReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StockReservation $stockReservation): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage inventory');
    }

    public function update(User $user, StockReservation $stockReservation): bool
    {
        return $user->can('manage inventory');
    }

    public function delete(User $user, StockReservation $stockReservation): bool
    {
        return $user->can('manage inventory');
    }
}
