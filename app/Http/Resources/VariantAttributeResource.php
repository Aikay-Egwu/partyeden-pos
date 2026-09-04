<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantAttributeResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'variant_id' => $this->variant_id,
            'attribute_value_id' => $this->attribute_value_id,
            'attribute_value' => AttributeValueResource::make($this->whenLoaded('attributeValue')),
            'variant' => VariantResource::make($this->whenLoaded('variant')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
