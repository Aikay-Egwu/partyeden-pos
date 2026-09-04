<?php

use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

test('store product listing uses the default product image url', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'is_active' => true,
    ]);
    $variant = Variant::factory()->create([
        'product_id' => $product->id,
        'is_active' => true,
    ]);
    $addOn = Product::factory()->create(['is_active' => true]);

    $defaultImage = ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/default.jpg',
        'file_name' => 'default.jpg',
        'is_primary' => true,
        'sort_order' => 0,
    ]);
    ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/variant.jpg',
        'file_name' => 'variant.jpg',
        'variant_id' => $variant->id,
        'is_primary' => false,
        'sort_order' => 1,
    ]);
    ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/addon.jpg',
        'file_name' => 'addon.jpg',
        'addon_product_id' => $addOn->id,
        'is_primary' => false,
        'sort_order' => 2,
    ]);

    $this->get(route('store.products'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products/index')
            ->where('products.data', function ($products) use ($defaultImage, $product) {
                return collect($products)->contains(fn (array $entry) => $entry['id'] === $product->id
                    && $entry['primary_image'] === $defaultImage->fresh()->url);
            })
        );
});

test('store product detail returns active variants and bound image metadata', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'is_active' => true,
        'customise_color' => true,
    ]);
    $activeVariant = Variant::factory()->create([
        'product_id' => $product->id,
        'name' => 'Pink Heart',
        'is_active' => true,
    ]);
    Variant::factory()->create([
        'product_id' => $product->id,
        'name' => 'Hidden Variant',
        'is_active' => false,
    ]);
    $color = Color::create([
        'name' => 'Coral',
        'hex_code' => '#FF7F50',
        'is_active' => true,
    ]);
    $product->mainColors()->create(['color_id' => $color->id]);

    $addOn = Product::factory()->create(['is_active' => true]);
    $product->addOns()->attach($addOn->id, [
        'id' => (string) Str::uuid(),
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $defaultImage = ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/default.jpg',
        'file_name' => 'default.jpg',
        'alt_text' => 'Default product image',
        'is_primary' => true,
        'sort_order' => 0,
    ]);
    ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/variant.jpg',
        'file_name' => 'variant.jpg',
        'variant_id' => $activeVariant->id,
        'alt_text' => 'Variant image',
        'is_primary' => false,
        'sort_order' => 1,
    ]);
    ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/color.jpg',
        'file_name' => 'color.jpg',
        'primary_color_id' => $color->id,
        'alt_text' => 'Color image',
        'is_primary' => false,
        'sort_order' => 2,
    ]);
    ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/addon-combo.jpg',
        'file_name' => 'addon-combo.jpg',
        'addon_product_id' => $addOn->id,
        'alt_text' => 'Addon combo image',
        'is_primary' => false,
        'sort_order' => 3,
    ]);
    ProductImage::create([
        'product_id' => $addOn->id,
        'file_path' => 'products/addon-default.jpg',
        'file_name' => 'addon-default.jpg',
        'is_primary' => true,
    ]);

    $this->get(route('store.products.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products/show')
            ->where('product.id', $product->id)
            ->has('product.variants', 1)
            ->where('product.variants.0.id', $activeVariant->id)
            ->where('product.images', function ($images) use ($activeVariant, $addOn, $color, $defaultImage) {
                $imageCollection = collect($images);

                return $imageCollection->contains(fn (array $image) => $image['binding_type'] === 'default'
                    && $image['id'] === $defaultImage->id
                    && $image['url'] === $defaultImage->fresh()->url
                    && $image['is_primary'] === true)
                    && $imageCollection->contains(fn (array $image) => $image['binding_type'] === 'variant'
                        && $image['variant_id'] === $activeVariant->id)
                    && $imageCollection->contains(fn (array $image) => $image['binding_type'] === 'primary_color'
                        && $image['primary_color_id'] === $color->id)
                    && $imageCollection->contains(fn (array $image) => $image['binding_type'] === 'addon'
                        && $image['addon_product_id'] === $addOn->id);
            })
            ->where('product.add_ons', function ($addOns) use ($addOn) {
                return count($addOns) === 1
                    && $addOns[0]['id'] === $addOn->id
                    && count($addOns[0]['images']) === 2
                    && filled($addOns[0]['images'][0]['url']);
            })
        );
});
