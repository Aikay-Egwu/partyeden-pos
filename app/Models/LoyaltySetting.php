<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Stores the editable loyalty program configuration used by checkout and admin tools.
 */
class LoyaltySetting extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'points_per_currency_unit' => 'decimal:4',
        'currency_value_per_point' => 'decimal:4',
        'is_active' => 'boolean',
    ];
}
