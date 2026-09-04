<?php

namespace Database\Factories;

use App\Models\AttributeValue;
use App\Models\Variant;
use App\Models\VariantAttribute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VariantAttribute>
 */
class VariantAttributeFactory extends Factory
{
    protected $model = VariantAttribute::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'variant_id' => Variant::factory(),
            'attribute_value_id' => AttributeValue::factory(),
        ];
    }
}
