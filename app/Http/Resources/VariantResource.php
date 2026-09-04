<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'price_adjustment' => $this->price_adjustment,
            'cost_price_adjustment' => $this->cost_price_adjustment,
            'is_active' => $this->is_active,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'attribute_values' => AttributeValueResource::collection($this->whenLoaded('attributeValues')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
