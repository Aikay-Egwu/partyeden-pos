<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TransactionItem;
use App\Models\User;

class TransactionItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TransactionItem $transactionItem): bool
    {
        return true;
    }
}
