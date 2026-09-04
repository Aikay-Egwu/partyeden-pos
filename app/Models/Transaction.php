<?php

namespace App\Models;

use App\Concerns\FilterableByDateRange;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use FilterableByDateRange, HasFactory, HasUuids, SoftDeletes;

    /**
     * Explicit allow-list — columns not listed here can never be mass-assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'transaction_number',
        'till_session_id',
        'staff_id',
        'customer_id',
        'location_id',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total',
        'discount_id',
        'notes',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'subtotal' => 'decimal:4',
        'tax_amount' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'total' => 'decimal:4',
    ];

    /** @return BelongsTo<TillSession, $this> */
    public function tillSession(): BelongsTo
    {
        return $this->belongsTo(TillSession::class);
    }

    /** @return BelongsTo<Staff, $this> */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

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

    /** @return BelongsTo<Discount, $this> */
    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }

    /** @return HasMany<TransactionItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /** @return HasMany<TransactionPayment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(TransactionPayment::class);
    }

    /** @return HasOne<ReturnModel, $this> */
    public function return(): HasOne
    {
        return $this->hasOne(ReturnModel::class);
    }

    /** @return HasMany<LoyaltyTransaction, $this> */
    public function loyaltyTransactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    /** @return HasMany<GiftCardTransaction, $this> */
    public function giftCardTransactions(): HasMany
    {
        return $this->hasMany(GiftCardTransaction::class);
    }
}
