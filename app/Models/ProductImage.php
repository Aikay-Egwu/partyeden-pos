<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    protected $appends = ['url'];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'file_size' => 'integer',
        'is_primary' => 'boolean',
        'primary_color_id' => 'integer',
    ];

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<Variant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class);
    }

    /** @return BelongsTo<Color, $this> */
    public function primaryColor(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'primary_color_id');
    }

    /** @return BelongsTo<Product, $this> */
    public function addonProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'addon_product_id');
    }

    public function isDefaultImage(): bool
    {
        return $this->variant_id === null
            && $this->primary_color_id === null
            && $this->addon_product_id === null;
    }

    public function bindingType(): string
    {
        if ($this->addon_product_id !== null) {
            return 'addon';
        }

        if ($this->variant_id !== null) {
            return 'variant';
        }

        if ($this->primary_color_id !== null) {
            return 'primary_color';
        }

        return 'default';
    }

    /**
     * Resolve a browser-friendly URL for the current storage disk.
     * Local public URLs use the current request host so previews work on localhost,
     * 127.0.0.1, and other local aliases without depending on APP_URL.
     */
    public function getUrlAttribute(): string
    {
        $diskName = $this->storageDisk();

        if ($diskName === 'public' && ! app()->runningInConsole()) {
            return url('/storage/'.ltrim((string) $this->file_path, '/'));
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($diskName);

        return $disk->url((string) $this->file_path);
    }

    public static function storageDisk(): string
    {
        $defaultDisk = (string) config('filesystems.default', 'public');

        return $defaultDisk === 'local' ? 'public' : $defaultDisk;
    }
}
