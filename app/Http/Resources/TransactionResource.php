<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'total' => $this->total,
            'notes' => $this->notes,
            'staff' => StaffResource::make($this->whenLoaded('staff')),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'till_session' => TillSessionResource::make($this->whenLoaded('tillSession')),
            'discount' => DiscountResource::make($this->whenLoaded('discount')),
            'items' => TransactionItemResource::collection($this->whenLoaded('items')),
            'payments' => TransactionPaymentResource::collection($this->whenLoaded('payments')),
            'return' => ReturnResource::make($this->whenLoaded('return')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
