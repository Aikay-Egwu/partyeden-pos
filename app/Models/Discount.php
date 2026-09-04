<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discount extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'value' => 'decimal:4',
        'min_purchase_amount' => 'decimal:4',
        'max_discount_amount' => 'decimal:4',
        'starts_at' => 'date',
        'ends_at' => 'date',
        'is_active' => 'boolean',
        'is_stackable' => 'boolean',
        'apply_to_all' => 'boolean',
    ];

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
