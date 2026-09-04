<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttributeValue extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /** @return BelongsTo<Attribute, $this> */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    /** @return HasMany<VariantAttribute, $this> */
    public function variantAttributes(): HasMany
    {
        return $this->hasMany(VariantAttribute::class);
    }

    /** @return BelongsToMany<Variant, $this> */
    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(Variant::class, 'variant_attributes')
            ->using(VariantAttribute::class)
            ->withTimestamps();
    }
}
