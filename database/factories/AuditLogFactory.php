<?php

namespace Database\Factories;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event' => 'updated',
            'auditable_type' => 'App\\Models\\Product',
            'auditable_id' => $this->faker->uuid(),
            'ip_address' => $this->faker->ipv4(),
            'description' => $this->faker->sentence(),
        ];
    }
}
