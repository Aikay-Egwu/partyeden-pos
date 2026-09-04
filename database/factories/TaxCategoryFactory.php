<?php

namespace Database\Factories;

use App\Models\TaxCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TaxCategory>
 */
class TaxCategoryFactory extends Factory
{
    protected $model = TaxCategory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'VAT '.$this->faker->word(),
            'code' => strtoupper(Str::random(6)),
            'rate' => 20,
            'is_default' => false,
            'is_active' => true,
        ];
    }
}
