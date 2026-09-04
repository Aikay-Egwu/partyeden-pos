<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierProductResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'product_id' => $this->product_id,
            'supplier_sku' => $this->supplier_sku,
            'cost_price' => $this->cost_price,
            'currency' => $this->currency,
            'lead_time_days' => $this->lead_time_days,
            'min_order_qty' => $this->min_order_qty,
            'is_preferred' => $this->is_preferred,
            'supplier' => SupplierResource::make($this->whenLoaded('supplier')),
            'product' => ProductResource::make($this->whenLoaded('product')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
