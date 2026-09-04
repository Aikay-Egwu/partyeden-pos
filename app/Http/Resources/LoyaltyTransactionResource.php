<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoyaltyTransactionResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'loyalty_account_id' => $this->loyalty_account_id,
            'type' => $this->type,
            'points' => $this->points,
            'balance_after' => $this->balance_after,
            'transaction_id' => $this->transaction_id,
            'description' => $this->description,
            'staff_id' => $this->staff_id,
            'loyalty_account' => LoyaltyAccountResource::make($this->whenLoaded('loyaltyAccount')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
