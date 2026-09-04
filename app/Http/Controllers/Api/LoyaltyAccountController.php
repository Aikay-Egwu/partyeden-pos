<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\LoyaltyAccountResource;
use App\Models\Customer;
use App\Models\LoyaltyAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyAccountController extends ApiController
{
    public function show(Customer $customer): LoyaltyAccountResource
    {
        $this->authorize('view', LoyaltyAccount::class);

        $account = $customer->loyaltyAccount()
            ->withCount('transactions')
            ->firstOrFail();

        return new LoyaltyAccountResource($account);
    }

    public function adjust(Request $request, LoyaltyAccount $loyaltyAccount): LoyaltyAccountResource
    {
        $this->authorize('update', $loyaltyAccount);

        $request->validate([
            'points' => ['required', 'numeric'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $points = (float) $request->input('points');

        $loyaltyAccount->update([
            'points_balance' => $loyaltyAccount->points_balance + $points,
            'total_points_earned' => $points > 0
                ? $loyaltyAccount->total_points_earned + $points
                : $loyaltyAccount->total_points_earned,
        ]);

        $loyaltyAccount->transactions()->create([
            'type' => 'adjust',
            'points' => $points,
            'balance_after' => $loyaltyAccount->points_balance,
            'description' => $request->input('description', 'Manual adjustment'),
            'staff_id' => auth()->id(),
        ]);

        return new LoyaltyAccountResource($loyaltyAccount->refresh());
    }

    public function deactivate(LoyaltyAccount $loyaltyAccount): JsonResponse
    {
        $this->authorize('update', $loyaltyAccount);

        $loyaltyAccount->update(['is_active' => false]);

        return response()->json(['message' => 'Loyalty account deactivated.']);
    }
}
