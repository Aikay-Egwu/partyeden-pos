<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * AuthAttemptLog — immutable audit record of every login/authentication
 * attempt (both SUCCESS and FAIL outcomes).
 *
 * Fields are mass-assignable because rows are only ever written by trusted
 * middleware/service code; records are never updated. Uses standard
 * timestamps() for simplicity (updated_at is written by Eloquent but
 * functionally unused as we never mutate these rows).
 */
class AuthAttemptLog extends Model
{
    /**
     * Fields that may be set via mass-assignment when recording an attempt.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'ip_address',
        'browser',
        'os',
        'device_type',
        'outcome',
        'reason',
        'user_type',
        'user_id',
    ];
}
