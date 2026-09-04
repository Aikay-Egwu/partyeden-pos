<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Shipment;
use App\Models\User;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Shipment $shipment): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('manage orders');
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return $user->can('manage orders');
    }

    public function delete(User $user, Shipment $shipment): bool
    {
        return $user->can('manage orders');
    }
}
