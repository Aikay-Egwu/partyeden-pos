<?php

namespace App\Models;

use Database\Factories\ComponentFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Component extends Model
{
    /** @use HasFactory<ComponentFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'cost_price' => 'decimal:4',
        'selling_price' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    /** @return HasMany<KitMapping, $this> */
    public function kitMappings(): HasMany
    {
        return $this->hasMany(KitMapping::class, 'product_id');
    }

    /** @return BelongsToMany<Product, $this> */
    public function kitProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'kit_mappings', 'product_id', 'kit_product_id')
            ->withPivot(['quantity'])
            ->withTimestamps();
    }
}
