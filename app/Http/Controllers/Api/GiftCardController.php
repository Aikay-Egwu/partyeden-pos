<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\GiftCard\AdjustBalanceRequest;
use App\Http\Requests\GiftCard\StoreGiftCardRequest;
use App\Http\Requests\GiftCard\UpdateGiftCardRequest;
use App\Http\Resources\GiftCardResource;
use App\Models\GiftCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class GiftCardController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', GiftCard::class);

        $giftCards = GiftCard::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('code', 'like', "%{$s}%")
                    ->orWhere('recipient_name', 'like', "%{$s}%")
                    ->orWhere('recipient_email', 'like', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->customer_id, fn ($q, $id) => $q->where('customer_id', $id))
            ->with('customer')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return GiftCardResource::collection($giftCards);
    }

    public function store(StoreGiftCardRequest $request): GiftCardResource
    {
        $this->authorize('create', GiftCard::class);

        $amount = $request->validated('original_amount');

        $giftCard = GiftCard::create(array_merge($request->validated(), [
            'code' => 'GC-'.strtoupper(Str::random(10)),
            'current_balance' => $amount,
            'status' => 'active',
            'issued_at' => now(),
            'issued_by' => auth()->id(),
        ]));

        // Log the purchase transaction
        $giftCard->transactions()->create([
            'type' => 'purchase',
            'amount' => $amount,
            'balance_after' => $amount,
            'description' => 'Gift card purchased',
            'staff_id' => auth()->id(),
        ]);

        return new GiftCardResource($giftCard->load('customer'));
    }

    public function show(GiftCard $giftCard): GiftCardResource
    {
        $this->authorize('view', $giftCard);

        $giftCard->load(['customer', 'issuedBy', 'transactions']);

        return new GiftCardResource($giftCard);
    }

    public function update(UpdateGiftCardRequest $request, GiftCard $giftCard): GiftCardResource
    {
        $this->authorize('update', $giftCard);

        $giftCard->update($request->validated());

        return new GiftCardResource($giftCard->refresh());
    }

    public function destroy(GiftCard $giftCard): JsonResponse
    {
        $this->authorize('delete', $giftCard);

        $giftCard->update(['status' => 'cancelled']);

        return $this->respondDeleted('Gift card');
    }

    public function adjustBalance(AdjustBalanceRequest $request, GiftCard $giftCard): GiftCardResource
    {
        $this->authorize('update', $giftCard);

        $amount = (float) $request->validated('amount');
        $newBalance = $giftCard->current_balance + $amount;

        $giftCard->update(['current_balance' => $newBalance]);

        $giftCard->transactions()->create([
            'type' => $amount >= 0 ? 'refund' : 'adjustment',
            'amount' => $amount,
            'balance_after' => $newBalance,
            'description' => $request->validated('description') ?? 'Balance adjustment',
            'staff_id' => auth()->id(),
        ]);

        return new GiftCardResource($giftCard->refresh());
    }
}
