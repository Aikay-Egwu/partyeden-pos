<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pivot model for product_add_ons table.
 *
 * Links a parent product to another product offered as an add-on.
 * Both product_id and add_on_product_id reference the products table.
 *
 * Example: "Number Stack" (parent) → "2 Helium Bunch" (add-on).
 */
class ProductAddOn extends Model
{
    use HasUuids;

    protected $table = 'product_add_ons';

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * The parent product that offers add-ons.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * The add-on product itself.
     *
     * @return BelongsTo<Product, $this>
     */
    public function addOnProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'add_on_product_id');
    }
}
