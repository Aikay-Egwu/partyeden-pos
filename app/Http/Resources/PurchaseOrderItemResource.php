<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderItemResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_order_id' => $this->purchase_order_id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'quantity' => $this->quantity,
            'quantity_received' => $this->quantity_received,
            'unit_cost' => $this->unit_cost,
            'total_cost' => $this->total_cost,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'variant' => VariantResource::make($this->whenLoaded('variant')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
