<?php

use App\Models\Color;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

test('admin can upload product image', function () {
    Storage::fake(ProductImage::storageDisk());

    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();

    $file = UploadedFile::fake()->image('test.jpg');

    $this->post(route('products.images.store', $product), [
        'image' => $file,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'file_name' => 'test.jpg',
        'is_primary' => true,
    ]);
});

test('admin can set primary image', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $image1 = ProductImage::create(['product_id' => $product->id, 'file_path' => 'img1.jpg', 'file_name' => 'img1.jpg', 'is_primary' => true]);
    $image2 = ProductImage::create(['product_id' => $product->id, 'file_path' => 'img2.jpg', 'file_name' => 'img2.jpg', 'is_primary' => false]);

    $this->patch(route('products.images.primary', [$product, $image2]))
        ->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'id' => $image1->id,
        'is_primary' => false,
    ]);

    $this->assertDatabaseHas('product_images', [
        'id' => $image2->id,
        'is_primary' => true,
    ]);
});

test('admin can delete product image', function () {
    Storage::fake(ProductImage::storageDisk());
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $product = Product::factory()->create();
    $image = ProductImage::create(['product_id' => $product->id, 'file_path' => 'test/path.jpg', 'file_name' => 'path.jpg']);

    $this->delete(route('products.images.destroy', [$product, $image]))
        ->assertRedirect();

    $this->assertSoftDeleted('product_images', [
        'id' => $image->id,
    ]);
});

test('admin can upload a variant-bound product image', function () {
    Storage::fake(ProductImage::storageDisk());

    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id]);

    $this->post(route('products.images.store', $product), [
        'image' => UploadedFile::fake()->image('variant.jpg'),
        'variant_id' => $variant->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'variant_id' => $variant->id,
        'is_primary' => false,
    ]);
});

test('admin can upload a primary color image for a product', function () {
    Storage::fake(ProductImage::storageDisk());

    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create(['customise_color' => true]);
    $color = Color::create(['name' => 'Coral', 'hex_code' => '#FF7F50', 'is_active' => true]);
    $product->mainColors()->create(['color_id' => $color->id]);

    $this->post(route('products.images.store', $product), [
        'image' => UploadedFile::fake()->image('coral.jpg'),
        'primary_color_id' => $color->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'primary_color_id' => $color->id,
    ]);
});

test('admin can upload an addon combo image', function () {
    Storage::fake(ProductImage::storageDisk());

    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $addOn = Product::factory()->create();
    $product->addOns()->attach($addOn->id, [
        'id' => (string) Str::uuid(),
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $this->post(route('products.images.store', $product), [
        'image' => UploadedFile::fake()->image('combo.jpg'),
        'addon_product_id' => $addOn->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'addon_product_id' => $addOn->id,
    ]);
});

test('admin can update product image binding metadata', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id]);
    $image = ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/test.jpg',
        'file_name' => 'test.jpg',
        'is_primary' => true,
    ]);

    $this->patch(route('products.images.update', [$product, $image]), [
        'variant_id' => $variant->id,
        'alt_text' => 'Updated variant image',
        'sort_order' => 3,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'id' => $image->id,
        'variant_id' => $variant->id,
        'alt_text' => 'Updated variant image',
        'sort_order' => 3,
        'is_primary' => false,
    ]);
});

test('rebinding a primary default image promotes the next default image', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);

    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id]);
    $primaryImage = ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/primary.jpg',
        'file_name' => 'primary.jpg',
        'is_primary' => true,
        'sort_order' => 0,
    ]);
    $fallbackImage = ProductImage::create([
        'product_id' => $product->id,
        'file_path' => 'products/fallback.jpg',
        'file_name' => 'fallback.jpg',
        'is_primary' => false,
        'sort_order' => 1,
    ]);

    $this->patch(route('products.images.update', [$product, $primaryImage]), [
        'variant_id' => $variant->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'id' => $primaryImage->id,
        'variant_id' => $variant->id,
        'is_primary' => false,
    ]);

    $this->assertDatabaseHas('product_images', [
        'id' => $fallbackImage->id,
        'is_primary' => true,
    ]);
});

test('admin cannot bind a product image to a variant from another product', function () {
    Storage::fake(ProductImage::storageDisk());

    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $product = Product::factory()->create();
    $otherVariant = Variant::factory()->create();

    $this->from(route('products.edit', $product))
        ->post(route('products.images.store', $product), [
            'image' => UploadedFile::fake()->image('bad.jpg'),
            'variant_id' => $otherVariant->id,
        ])
        ->assertRedirect(route('products.edit', $product))
        ->assertSessionHasErrors(['variant_id']);
});
