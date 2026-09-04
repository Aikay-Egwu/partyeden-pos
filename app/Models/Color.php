<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Color reference — used for product color customization.
 *
 * Linked to products via product_main_colors / product_secondary_colors
 * pivot tables, and to order_items for customer color choices.
 */
class Color extends Model
{
    // Standard auto-increment integer PK — matches existing pivot FK references

    protected $fillable = ['name', 'hex_code', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /** @return HasMany<ProductMainColor, $this> */
    public function mainProductLinks(): HasMany
    {
        return $this->hasMany(ProductMainColor::class, 'color_id');
    }

    /** @return HasMany<ProductSecondaryColor, $this> */
    public function secondaryProductLinks(): HasMany
    {
        return $this->hasMany(ProductSecondaryColor::class, 'color_id');
    }

    /** @return HasMany<ProductImage, $this> */
    public function productImages(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'primary_color_id');
    }
}
