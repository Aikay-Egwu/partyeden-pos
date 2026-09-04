<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GiftCard extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * Explicit allow-list — columns not listed here can never be mass-assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'original_amount',
        'current_balance',
        'status',
        'customer_id',
        'recipient_name',
        'recipient_email',
        'message',
        'issued_at',
        'expires_at',
        'issued_by',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'original_amount' => 'decimal:4',
        'current_balance' => 'decimal:4',
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return BelongsTo<User, $this> */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /** @return HasMany<GiftCardTransaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(GiftCardTransaction::class);
    }
}
