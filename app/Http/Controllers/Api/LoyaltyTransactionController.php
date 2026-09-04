<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\LoyaltyTransaction\StoreLoyaltyTransactionRequest;
use App\Http\Resources\LoyaltyTransactionResource;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoyaltyTransactionController extends ApiController
{
    public function index(Request $request, LoyaltyAccount $loyaltyAccount): JsonResource
    {
        $this->authorize('viewAny', LoyaltyTransaction::class);

        $transactions = $loyaltyAccount->transactions()
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return LoyaltyTransactionResource::collection($transactions);
    }

    public function store(StoreLoyaltyTransactionRequest $request, LoyaltyAccount $loyaltyAccount): LoyaltyTransactionResource
    {
        $this->authorize('create', LoyaltyTransaction::class);

        $points = (float) $request->validated('points');
        $type = $request->validated('type');

        // Calculate new balance
        $newBalance = match ($type) {
            'earn' => $loyaltyAccount->points_balance + $points,
            'redeem', 'expire' => $loyaltyAccount->points_balance - abs($points),
            'adjust' => $loyaltyAccount->points_balance + $points,
            default => $loyaltyAccount->points_balance,
        };

        // Update account balance
        $updateData = ['points_balance' => $newBalance];
        if ($type === 'earn') {
            $updateData['total_points_earned'] = $loyaltyAccount->total_points_earned + abs($points);
        } elseif ($type === 'redeem') {
            $updateData['total_points_redeemed'] = $loyaltyAccount->total_points_redeemed + abs($points);
        }
        $loyaltyAccount->update($updateData);

        $transaction = $loyaltyAccount->transactions()->create([
            'type' => $type,
            'points' => $points,
            'balance_after' => $newBalance,
            'transaction_id' => $request->validated('transaction_id'),
            'description' => $request->validated('description'),
            'staff_id' => auth()->id(),
        ]);

        return new LoyaltyTransactionResource($transaction);
    }
}
