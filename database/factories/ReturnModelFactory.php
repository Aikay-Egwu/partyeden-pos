<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\ReturnModel;
use App\Models\Staff;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ReturnModel>
 */
class ReturnModelFactory extends Factory
{
    protected $model = ReturnModel::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'return_number' => 'RET-'.strtoupper(Str::random(12)),
            'transaction_id' => Transaction::factory(),
            'staff_id' => Staff::factory(),
            'location_id' => Location::factory(),
            'status' => 'pending',
            'total_refund' => $this->faker->randomFloat(2, 1, 100),
        ];
    }
}
