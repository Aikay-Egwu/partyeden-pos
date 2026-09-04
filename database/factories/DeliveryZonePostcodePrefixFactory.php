<?php

namespace Database\Factories;

use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeliveryZonePostcodePrefix>
 */
class DeliveryZonePostcodePrefixFactory extends Factory
{
    protected $model = DeliveryZonePostcodePrefix::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'delivery_zone_id' => DeliveryZone::factory(),
            // Outward-code style prefix, e.g. "SW1A"
            'code_prefix' => strtoupper($this->faker->unique()->bothify('??#?')),
            'level' => 'outward',
            'is_active' => true,
        ];
    }
}
