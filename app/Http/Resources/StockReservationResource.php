<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockReservationResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'location_id' => $this->location_id,
            'quantity' => $this->quantity,
            'order_id' => $this->order_id,
            'status' => $this->status,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'product' => ProductResource::make($this->whenLoaded('product')),
            'variant' => VariantResource::make($this->whenLoaded('variant')),
            'location' => LocationResource::make($this->whenLoaded('location')),
            'order' => OrderResource::make($this->whenLoaded('order')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
