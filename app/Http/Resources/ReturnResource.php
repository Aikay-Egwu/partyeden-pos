<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReturnResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'return_number' => $this->return_number,
            'transaction_id' => $this->transaction_id,
            'customer_id' => $this->customer_id,
            'staff_id' => $this->staff_id,
            'location_id' => $this->location_id,
            'status' => $this->status,
            'reason' => $this->reason,
            'total_refund' => $this->total_refund,
            'notes' => $this->notes,
            'processed_by' => $this->processed_by,
            'processed_at' => $this->processed_at?->toIso8601String(),
            'transaction' => TransactionResource::make($this->whenLoaded('transaction')),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'staff' => StaffResource::make($this->whenLoaded('staff')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'processed_by_user' => UserResource::make($this->whenLoaded('processedBy')),
            'items' => ReturnedItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
