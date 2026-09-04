<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fileName = Str::random(10).'.jpg';

        return [
            'product_id' => Product::factory(),
            'file_path' => 'products/'.$fileName,
            'file_name' => $fileName,
            'mime_type' => 'image/jpeg',
        ];
    }
}
