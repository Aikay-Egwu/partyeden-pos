<?php

namespace App\Models;

use App\Concerns\FilterableByDateRange;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use FilterableByDateRange, HasFactory, HasUuids, SoftDeletes;

    /**
     * Explicit allow-list — columns not listed here can never be mass-assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_number',
        'customer_id',
        'status',
        'payment_status',
        'payment_method',
        'paypal_order_id',
        'paypal_capture_id',
        'paypal_payer_email',
        'paypal_payer_id',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'loyalty_points_redeemed',
        'loyalty_points_earned',
        'shipping_amount',
        'total',
        'amount_paid',
        'paid_at',
        'location_id',
        'shipping_address',
        'billing_address',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_city',
        'notes',
        'fulfillment_type',
        'delivery_zone_id',
        'delivery_postcode',
        'created_by',
        'placed_at',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'subtotal' => 'decimal:4',
        'tax_amount' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'loyalty_points_redeemed' => 'decimal:4',
        'loyalty_points_earned' => 'decimal:4',
        'shipping_amount' => 'decimal:4',
        'total' => 'decimal:4',
        'amount_paid' => 'decimal:4',
        'placed_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return BelongsTo<Location, $this> */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /** @return BelongsTo<User, $this> */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<Shipment, $this> */
    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    /** @return HasMany<StockReservation, $this> */
    public function stockReservations(): HasMany
    {
        return $this->hasMany(StockReservation::class);
    }

    /**
     * Delivery zone matched from the customer's postcode.
     */
    public function deliveryZone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class, 'delivery_zone_id');
    }
}
