<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GiftCardResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'original_amount' => $this->original_amount,
            'current_balance' => $this->current_balance,
            'status' => $this->status,
            'customer_id' => $this->customer_id,
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'recipient_name' => $this->recipient_name,
            'recipient_email' => $this->recipient_email,
            'message' => $this->message,
            'issued_at' => $this->issued_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'issued_by' => $this->issued_by,
            'issued_by_user' => UserResource::make($this->whenLoaded('issuedBy')),
            'transactions' => GiftCardTransactionResource::collection($this->whenLoaded('transactions')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
