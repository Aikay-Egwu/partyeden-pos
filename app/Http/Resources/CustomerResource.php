<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'company_name' => $this->company_name,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'addresses' => CustomerAddressResource::collection($this->whenLoaded('addresses')),
            'addresses_count' => $this->whenCounted('addresses'),
            'loyalty_account' => LoyaltyAccountResource::make($this->whenLoaded('loyaltyAccount')),
            'orders_count' => $this->whenCounted('orders'),
            'transactions_count' => $this->whenCounted('transactions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
