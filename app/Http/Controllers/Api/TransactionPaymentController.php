<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\TransactionPaymentResource;
use App\Models\Transaction;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionPaymentController extends ApiController
{
    public function index(Transaction $transaction): JsonResource
    {
        $this->authorize('view', $transaction);

        $payments = $transaction->payments()->get();

        return TransactionPaymentResource::collection($payments);
    }
}
