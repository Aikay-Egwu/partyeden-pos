<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\TransactionPayment;
use App\Models\User;

class TransactionPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TransactionPayment $transactionPayment): bool
    {
        return true;
    }
}
