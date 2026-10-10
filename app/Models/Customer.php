<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Customer extends Authenticatable implements MustVerifyEmailContract
{
    use HasFactory, HasUuids, MustVerifyEmail, Notifiable, SoftDeletes;

    /**
     * Explicit allow-list — columns not listed here can never be mass-assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'remember_token',
        'email_verified_at',
        'phone',
        'date_of_birth',
        'company_name',
        'notes',
        'is_active',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * Attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Return the authentication role identifier for this user type.
     * Used by middleware/auth logic to distinguish customer vs admin sessions.
     */
    public function getAuthRole(): string
    {
        return 'customer';
    }

    /** @return HasMany<CustomerAddress, $this> */
    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    /** @return HasOne<LoyaltyAccount, $this> */
    public function loyaltyAccount(): HasOne
    {
        return $this->hasOne(LoyaltyAccount::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /** @return HasMany<ReturnModel, $this> */
    public function returns(): HasMany
    {
        return $this->hasMany(ReturnModel::class);
    }

    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** @return HasMany<GiftCard, $this> */
    public function giftCards(): HasMany
    {
        return $this->hasMany(GiftCard::class);
    }
}
