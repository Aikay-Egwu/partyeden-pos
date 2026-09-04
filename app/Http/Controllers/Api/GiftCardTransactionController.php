<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\GiftCardTransactionResource;
use App\Models\GiftCard;
use App\Models\GiftCardTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GiftCardTransactionController extends ApiController
{
    public function index(Request $request, GiftCard $giftCard): JsonResource
    {
        $this->authorize('viewAny', GiftCardTransaction::class);

        $transactions = $giftCard->transactions()
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return GiftCardTransactionResource::collection($transactions);
    }
}
