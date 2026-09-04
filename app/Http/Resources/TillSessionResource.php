<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TillSessionResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'staff_id' => $this->staff_id,
            'location_id' => $this->location_id,
            'opened_at' => $this->opened_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'opening_balance' => $this->opening_balance,
            'closing_balance' => $this->closing_balance,
            'expected_balance' => $this->expected_balance,
            'cash_sales' => $this->cash_sales,
            'status' => $this->status,
            'notes' => $this->notes,
            'variance' => $this->closing_balance !== null && $this->expected_balance !== null
                ? (float) $this->closing_balance - (float) $this->expected_balance
                : null,
            'staff' => StaffResource::make($this->whenLoaded('staff')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'transaction_count' => $this->whenCounted('transactions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
