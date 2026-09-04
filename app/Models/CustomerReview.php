<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerReview extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'is_featured' => 'boolean',
        'show_in_gallery' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function scopeApproved(Builder $query): void
    {
        $query->where('status', 'approved');
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<Occasion, $this> */
    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }
}
