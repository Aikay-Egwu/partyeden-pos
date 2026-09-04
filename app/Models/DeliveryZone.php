<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'delivery_price',
        'min_order_amount',
        'is_active',
        'notes',
    ];

    /**
     * @return HasMany<DeliveryZonePostcodePrefix>
     */
    public function prefixes(): HasMany
    {
        return $this->hasMany(DeliveryZonePostcodePrefix::class);
    }
}
