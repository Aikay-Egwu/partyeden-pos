<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\TransactionItemResource;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionItemController extends ApiController
{
    public function index(Transaction $transaction): JsonResource
    {
        $this->authorize('view', $transaction);

        $items = $transaction->items()
            ->with(['product', 'variant'])
            ->get();

        return TransactionItemResource::collection($items);
    }

    public function show(TransactionItem $transactionItem): TransactionItemResource
    {
        $this->authorize('view', $transactionItem->transaction);

        $transactionItem->load(['product', 'variant']);

        return new TransactionItemResource($transactionItem);
    }
}
