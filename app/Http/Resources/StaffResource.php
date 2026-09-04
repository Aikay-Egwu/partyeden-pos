<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    public static $collects = BaseCollection::class;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'employee_code' => $this->employee_code,
            'hourly_rate' => $this->hourly_rate,
            'hire_date' => $this->hire_date?->toIso8601String(),
            'termination_date' => $this->termination_date?->toIso8601String(),
            'is_active' => $this->is_active,
            'user' => UserResource::make($this->whenLoaded('user')),
            'till_sessions_count' => $this->whenCounted('tillSessions'),
            'transactions_count' => $this->whenCounted('transactions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
