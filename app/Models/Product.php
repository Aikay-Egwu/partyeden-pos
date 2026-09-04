<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_kit' => 'boolean',
        'track_inventory' => 'boolean',
        'reorder_level' => 'decimal:2',
        'customise_color' => 'boolean',
        'customise_text' => 'boolean',
        'preorder' => 'boolean',
        'is_online_visible' => 'boolean',
        'best_seller_enabled' => 'boolean',
    ];

    /**
     * Scope to only include products that are visible on the public storefront.
     *
     * @param  Builder<Product>  $query
     */
    public function scopeOnlineVisible(Builder $query): void
    {
        $query->where('is_online_visible', true);
    }

    protected static function boot(): void
    {
        parent::boot();

        // Auto-generate slug from product name before creation
        static::creating(function (Product $product) {
            if (empty($product->slug) && ! empty($product->name)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
        });

        // Auto-derive is_kit flag from product_type on every save.
        // Keeps the boolean in sync so queries like "WHERE is_kit = false"
        // return only non-kit products usable as kit components.
        static::saving(function (Product $product) {
            $product->is_kit = $product->product_type === 'kit';
        });
    }

    /**
     * Generate a unique URL-friendly slug from a given name.
     * Appends a numeric suffix if the slug already exists.
     */
    protected static function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $original.'-'.$counter++;
        }

        return $slug;
    }

    /**
     * Generate the next available SKU in the format SKU-XXXXXX.
     * Finds the highest existing numeric suffix and increments by 1.
     * Uses PHP-side max() for SQLite compatibility.
     */
    public static function generateNextSku(): string
    {
        $max = static::query()
            ->where('sku', 'like', 'SKU-%')
            ->pluck('sku')
            ->map(fn ($sku) => (int) substr($sku, 4))
            ->filter(fn ($n) => $n > 0)
            ->max() ?? 0;

        return sprintf('SKU-%06d', $max + 1);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<TaxCategory, $this> */
    public function taxCategory(): BelongsTo
    {
        return $this->belongsTo(TaxCategory::class);
    }

    /** @return HasMany<Variant, $this> */
    public function variants(): HasMany
    {
        return $this->hasMany(Variant::class);
    }

    /** @return HasMany<PriceHistory, $this> */
    public function priceHistories(): HasMany
    {
        return $this->hasMany(PriceHistory::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function defaultImages(): HasMany
    {
        return $this->images()
            ->whereNull('variant_id')
            ->whereNull('primary_color_id')
            ->whereNull('addon_product_id');
    }

    /** @return HasMany<ProductImage, $this> */
    public function variantImages(): HasMany
    {
        return $this->images()->whereNotNull('variant_id');
    }

    /** @return HasMany<ProductImage, $this> */
    public function primaryColorImages(): HasMany
    {
        return $this->images()->whereNotNull('primary_color_id');
    }

    /** @return HasMany<ProductImage, $this> */
    public function addonComboImages(): HasMany
    {
        return $this->images()->whereNotNull('addon_product_id');
    }

    /** @return HasMany<KitMapping, $this> */
    public function kitMappings(): HasMany
    {
        return $this->hasMany(KitMapping::class, 'kit_product_id');
    }

    /** @return HasMany<SupplierProduct, $this> */
    public function supplierProducts(): HasMany
    {
        return $this->hasMany(SupplierProduct::class);
    }

    /** @return BelongsToMany<Supplier, $this> */
    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, 'supplier_products')
            ->withPivot(['supplier_sku', 'cost_price', 'lead_time_days', 'min_order_qty', 'is_preferred'])
            ->withTimestamps();
    }

    /** @return HasMany<TransactionItem, $this> */
    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<InventoryBalance, $this> */
    public function inventoryBalances(): HasMany
    {
        return $this->hasMany(InventoryBalance::class);
    }

    /** @return HasMany<StockReservation, $this> */
    public function stockReservations(): HasMany
    {
        return $this->hasMany(StockReservation::class);
    }

    /**
     * Main colors available for this product (via product_main_colors pivot).
     *
     * @return HasMany<ProductMainColor, $this>
     */
    public function mainColors(): HasMany
    {
        return $this->hasMany(ProductMainColor::class);
    }

    /**
     * Secondary colors available for this product (via product_secondary_colors pivot).
     *
     * @return HasMany<ProductSecondaryColor, $this>
     */
    public function secondaryColors(): HasMany
    {
        return $this->hasMany(ProductSecondaryColor::class);
    }

    /**
     * Add-on products linked to this parent product.
     * E.g., "Number Stack" has add-ons "2 Helium Bunch" and "5 Helium Bunch".
     *
     * @return BelongsToMany<Product, $this>
     */
    public function addOns(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_add_ons',
            'product_id',         // Foreign key on pivot (this product)
            'add_on_product_id'   // Related key on pivot (the add-on product)
        )->withPivot(['is_active', 'sort_order'])
            ->withTimestamps();
    }

    /**
     * Occasion groupings used by storefront merchandising and landing pages.
     *
     * @return BelongsToMany<Occasion, $this>
     */
    public function occasions(): BelongsToMany
    {
        return $this->belongsToMany(Occasion::class)
            ->withPivot(['id', 'sort_order'])
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    /**
     * Parent products that offer this product as an add-on.
     * Inverse of addOns().
     *
     * @return BelongsToMany<Product, $this>
     */
    public function parentProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_add_ons',
            'add_on_product_id',  // Foreign key on pivot (this product as add-on)
            'product_id'          // Related key on pivot (the parent)
        )->withPivot(['is_active', 'sort_order'])
            ->withTimestamps();
    }

    /**
     * Setup instruction for this product (one-to-one).
     *
     * @return HasOne<SetupInstruction, $this>
     */
    public function setupInstruction(): HasOne
    {
        return $this->hasOne(SetupInstruction::class);
    }
}
