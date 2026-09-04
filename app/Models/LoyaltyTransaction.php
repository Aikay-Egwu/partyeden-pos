<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoyaltyTransaction extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * Explicit allow-list — columns not listed here can never be mass-assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'loyalty_account_id',
        'type',
        'points',
        'balance_after',
        'transaction_id',
        'order_id',
        'description',
        'staff_id',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'points' => 'decimal:4',
        'balance_after' => 'decimal:4',
    ];

    /** @return BelongsTo<LoyaltyAccount, $this> */
    public function loyaltyAccount(): BelongsTo
    {
        return $this->belongsTo(LoyaltyAccount::class);
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Staff, $this> */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id')->withDefault();
    }
}
