<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Component;
use App\Models\KitMapping;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 3 categories
        $categories = Category::factory()->count(3)->create();

        // Create 10 products assigned to random categories
        $products = collect();

        for ($i = 0; $i < 10; $i++) {
            $products->push(Product::factory()->create([
                'category_id' => $categories->random()->id,
            ]));
        }

        // Select 4 random products to have variants
        $productsWithVariants = $products->random(4);

        foreach ($productsWithVariants as $product) {
            Variant::factory()->count(rand(2, 3))->create([
                'product_id' => $product->id,
            ]);
        }

        // Create components for kit products
        $components = Component::factory()->count(8)->create();

        // Select 2 random products to be kit products
        $kitProducts = $products->random(2);

        foreach ($kitProducts as $kitProduct) {
            $kitProduct->update(['product_type' => 'kit']);

            $kitComponents = $components->take(4);
            $components = $components->slice(4);

            foreach ($kitComponents as $component) {
                KitMapping::factory()->create([
                    'kit_product_id' => $kitProduct->id,
                    'component_id' => $component->id,
                    'quantity' => rand(1, 5),
                ]);
            }
        }
    }
}
