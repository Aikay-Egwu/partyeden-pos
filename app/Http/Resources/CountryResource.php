<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'code3' => $this->code3,
            'phone_code' => $this->phone_code,
            'currency' => $this->currency,
            'currency_symbol' => $this->currency_symbol,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'suppliers_count' => $this->whenCounted('suppliers'),
            'customer_addresses_count' => $this->whenCounted('customerAddresses'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
