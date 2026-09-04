<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'description' => $this->description,
            'category_id' => $this->category_id,
            'tax_category_id' => $this->tax_category_id,
            'cost_price' => $this->cost_price,
            'selling_price' => $this->selling_price,
            'product_type' => $this->product_type,
            'is_active' => $this->is_active,
            'track_inventory' => $this->track_inventory,
            'reorder_level' => $this->reorder_level,
            'unit' => $this->unit,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'tax_category' => TaxCategoryResource::make($this->whenLoaded('taxCategory')),
            'variants' => VariantResource::collection($this->whenLoaded('variants')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'variants_count' => $this->whenCounted('variants'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
