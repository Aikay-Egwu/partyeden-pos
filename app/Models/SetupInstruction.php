<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Setup instructions — one-to-one per product.
 *
 * Admin reference: tools, items, step-by-step instructions, and notes
 * for setting up or preparing this product.
 */
class SetupInstruction extends Model
{
    use HasUuids, SoftDeletes;

    protected $guarded = [];

    /**
     * The product this setup instruction belongs to.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
