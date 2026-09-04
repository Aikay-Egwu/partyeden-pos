<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryZonePostcodePrefix extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_zone_id',
        'code_prefix',
        'level',
        'is_active',
    ];

    /**
     * @return BelongsTo<DeliveryZone, DeliveryZonePostcodePrefix>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class, 'delivery_zone_id');
    }
}
