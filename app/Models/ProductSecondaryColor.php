<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSecondaryColor extends Model
{
    //
    use HasUuids;

    protected $table = 'product_secondary_colors';

    protected $fillable = ['product_id', 'color_id'];

    /**
     * The color this pivot links to.
     *
     * @return BelongsTo<Color, $this>
     */
    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_id');
    }
}
