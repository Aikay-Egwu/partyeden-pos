<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

// Custom pivot for the variant_attributes table. Uses a UUID primary key
// so BelongsToMany::attach/sync generates ids via HasUuids.
// SoftDeletes is intentionally not used: pivot links carry no data,
// and a unique(variant_id, attribute_value_id) constraint would clash
// with soft-deleted rows on re-attach.
class VariantAttribute extends Pivot
{
    use HasFactory, HasUuids;

    protected $table = 'variant_attributes';

    protected $guarded = [];

    public $incrementing = false;

    public $timestamps = true;

    protected $keyType = 'string';

    /** @return BelongsTo<Variant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class);
    }

    /** @return BelongsTo<AttributeValue, $this> */
    public function attributeValue(): BelongsTo
    {
        return $this->belongsTo(AttributeValue::class);
    }
}
