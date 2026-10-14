<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasUuids, SoftDeletes;

    protected $guarded = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'replied_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function markAsRead(): void
    {
        if ($this->status === 'new') {
            $this->update(['status' => 'read', 'read_at' => now()]);
        }
    }
}
