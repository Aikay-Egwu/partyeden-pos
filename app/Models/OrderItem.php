<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * Explicit allow-list — columns not listed here can never be mass-assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'parent_order_item_id',
        'product_id',
        'variant_id',
        'product_name',
        'quantity',
        'unit_price',
        'tax_amount',
        'discount_amount',
        'total',
        'status',
        'customization_text',
        'customization_font',
        'customization_primary_color_id',
        'customization_secondary_color_id',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:4',
        'tax_amount' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'total' => 'decimal:4',
        'parent_order_item_id' => 'string',
        'customization_primary_color_id' => 'integer',
        'customization_secondary_color_id' => 'integer',
    ];

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<self, $this> */
    public function parentItem(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_order_item_id');
    }

    /** @return HasMany<self, $this> */
    public function childItems(): HasMany
    {
        return $this->hasMany(self::class, 'parent_order_item_id');
    }

    /** @return BelongsTo<Variant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class);
    }

    /**
     * Primary color chosen by the customer for this order item.
     */
    public function customizationPrimaryColor(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'customization_primary_color_id');
    }

    /**
     * Secondary color chosen by the customer for this order item.
     */
    public function customizationSecondaryColor(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'customization_secondary_color_id');
    }
}
