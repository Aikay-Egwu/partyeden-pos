<?php

use App\Models\Color;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function adminUser(): User
{
    return User::factory()->create(['permissions' => ['admin']]);
}

test('admin can sync kit mappings for a kit product', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create(['product_type' => 'kit']);
    $component = Product::factory()->create(['is_kit' => false]);
    $variant = Variant::factory()->create(['product_id' => $product->id]);

    $this->from(route('products.edit', $product))
        ->post(route('products.kit-mappings.update', $product), [
            'mappings' => [
                [
                    'product_id' => $component->id,
                    'quantity' => 2.5,
                    'variant_id' => $variant->id,
                ],
            ],
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseHas('kit_mappings', [
        'kit_product_id' => $product->id,
        'product_id' => $component->id,
        'variant_id' => $variant->id,
        'quantity' => '2.5000',
    ]);
});

test('admin can sync product add-ons with status and sort order', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create();
    $firstAddOn = Product::factory()->create();
    $secondAddOn = Product::factory()->create();

    $this->from(route('products.edit', $product))
        ->post(route('products.add-ons.update', $product), [
            'add_ons' => [
                [
                    'add_on_product_id' => $firstAddOn->id,
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'add_on_product_id' => $secondAddOn->id,
                    'is_active' => false,
                    'sort_order' => 5,
                ],
            ],
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseHas('product_add_ons', [
        'product_id' => $product->id,
        'add_on_product_id' => $firstAddOn->id,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $this->assertDatabaseHas('product_add_ons', [
        'product_id' => $product->id,
        'add_on_product_id' => $secondAddOn->id,
        'is_active' => false,
        'sort_order' => 5,
    ]);

    $this->from(route('products.edit', $product))
        ->post(route('products.add-ons.update', $product), [
            'add_ons' => [
                [
                    'add_on_product_id' => $firstAddOn->id,
                    'is_active' => false,
                    'sort_order' => 9,
                ],
            ],
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseHas('product_add_ons', [
        'product_id' => $product->id,
        'add_on_product_id' => $firstAddOn->id,
        'is_active' => false,
        'sort_order' => 9,
    ]);

    $this->assertDatabaseMissing('product_add_ons', [
        'product_id' => $product->id,
        'add_on_product_id' => $secondAddOn->id,
    ]);
});

test('admin can sync and remove product colors', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create(['customise_color' => true]);
    $red = Color::create(['name' => 'Red', 'hex_code' => '#ff0000', 'is_active' => true]);
    $blue = Color::create(['name' => 'Blue', 'hex_code' => '#0000ff', 'is_active' => true]);
    $gold = Color::create(['name' => 'Gold', 'hex_code' => '#ffd700', 'is_active' => true]);

    $this->from(route('products.edit', $product))
        ->post(route('products.colors.update', $product), [
            'main_colors' => [$red->id, $blue->id],
            'secondary_colors' => [$gold->id],
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseHas('product_main_colors', [
        'product_id' => $product->id,
        'color_id' => $red->id,
    ]);

    $this->assertDatabaseHas('product_main_colors', [
        'product_id' => $product->id,
        'color_id' => $blue->id,
    ]);

    $this->assertDatabaseHas('product_secondary_colors', [
        'product_id' => $product->id,
        'color_id' => $gold->id,
    ]);

    $this->from(route('products.edit', $product))
        ->post(route('products.colors.update', $product), [
            'main_colors' => [$blue->id],
            'secondary_colors' => [],
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseMissing('product_main_colors', [
        'product_id' => $product->id,
        'color_id' => $red->id,
    ]);

    $this->assertDatabaseMissing('product_secondary_colors', [
        'product_id' => $product->id,
        'color_id' => $gold->id,
    ]);
});

test('admin can create a global color inline and attach it to the product', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create(['customise_color' => true]);

    $this->from(route('products.edit', $product))
        ->post(route('products.colors.store', $product), [
            'name' => 'Rose Gold',
            'hex_code' => 'c9a227',
            'target' => 'main',
        ])->assertRedirect(route('products.edit', $product));

    $color = Color::query()->where('name', 'Rose Gold')->first();

    expect($color)->toBeInstanceOf(Color::class);

    $this->assertDatabaseHas('colors', [
        'name' => 'Rose Gold',
        'hex_code' => '#C9A227',
        'is_active' => true,
    ]);

    $this->assertDatabaseHas('product_main_colors', [
        'product_id' => $product->id,
        'color_id' => $color->id,
    ]);
});

test('customisable product requires at least one main color', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create(['customise_color' => true]);

    $this->from(route('products.edit', $product))
        ->post(route('products.colors.update', $product), [
            'main_colors' => [],
            'secondary_colors' => [],
        ])
        ->assertRedirect(route('products.edit', $product))
        ->assertSessionHasErrors(['main_colors']);
});

test('product cannot have more than two secondary colors', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create(['customise_color' => true]);
    $mainColor = Color::create(['name' => 'White', 'hex_code' => '#FFFFFF', 'is_active' => true]);
    $secondaryOne = Color::create(['name' => 'Pink', 'hex_code' => '#FFC0CB', 'is_active' => true]);
    $secondaryTwo = Color::create(['name' => 'Gold', 'hex_code' => '#FFD700', 'is_active' => true]);
    $secondaryThree = Color::create(['name' => 'Black', 'hex_code' => '#000000', 'is_active' => true]);

    $this->from(route('products.edit', $product))
        ->post(route('products.colors.update', $product), [
            'main_colors' => [$mainColor->id],
            'secondary_colors' => [$secondaryOne->id, $secondaryTwo->id, $secondaryThree->id],
        ])
        ->assertRedirect(route('products.edit', $product))
        ->assertSessionHasErrors(['secondary_colors']);
});

test('product main and secondary colors cannot overlap', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create(['customise_color' => true]);
    $color = Color::create(['name' => 'Lilac', 'hex_code' => '#C8A2C8', 'is_active' => true]);

    $this->from(route('products.edit', $product))
        ->post(route('products.colors.update', $product), [
            'main_colors' => [$color->id],
            'secondary_colors' => [$color->id],
        ])
        ->assertRedirect(route('products.edit', $product))
        ->assertSessionHasErrors(['secondary_colors']);
});

test('admin can create and update setup instructions', function () {
    $user = adminUser();
    $this->actingAs($user);

    $product = Product::factory()->create();

    $this->from(route('products.edit', $product))
        ->post(route('products.setup-instruction.update', $product), [
            'tools' => 'Helium tank',
            'items' => 'Ribbon and weights',
            'instructions' => 'Inflate balloons and attach weights.',
            'notes' => 'Handle with care.',
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseHas('setup_instructions', [
        'product_id' => $product->id,
        'tools' => 'Helium tank',
    ]);

    $this->from(route('products.edit', $product))
        ->post(route('products.setup-instruction.update', $product), [
            'tools' => 'Helium tank and pump',
            'items' => 'Ribbon and weights',
            'instructions' => 'Inflate balloons, tie them, and attach weights.',
            'notes' => 'Keep away from heat.',
        ])->assertRedirect(route('products.edit', $product));

    $this->assertDatabaseCount('setup_instructions', 1);
    $this->assertDatabaseHas('setup_instructions', [
        'product_id' => $product->id,
        'tools' => 'Helium tank and pump',
        'notes' => 'Keep away from heat.',
    ]);
});
