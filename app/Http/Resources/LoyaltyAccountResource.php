<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoyaltyAccountResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'points_balance' => $this->points_balance,
            'total_points_earned' => $this->total_points_earned,
            'total_points_redeemed' => $this->total_points_redeemed,
            'is_active' => $this->is_active,
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'transactions_count' => $this->whenCounted('transactions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
