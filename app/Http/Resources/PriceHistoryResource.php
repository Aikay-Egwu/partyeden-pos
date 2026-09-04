<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriceHistoryResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'old_price' => $this->old_price,
            'new_price' => $this->new_price,
            'changed_by' => $this->changed_by,
            'reason' => $this->reason,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'variant' => VariantResource::make($this->whenLoaded('variant')),
            'changedBy' => UserResource::make($this->whenLoaded('changedBy')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
