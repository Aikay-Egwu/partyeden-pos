<?php

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\User;
use App\Models\Variant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Helper: create an attribute directly (no factory available).
function makeAttribute(array $overrides = []): Attribute
{
    return Attribute::create(array_merge([
        'name' => 'Size',
        'code' => 'size-'.uniqid(),
        'type' => 'select',
        'sort_order' => 0,
        'is_active' => true,
    ], $overrides));
}

// Helper: create an attribute value under an attribute.
function makeAttributeValue(Attribute $attribute, array $overrides = []): AttributeValue
{
    return $attribute->values()->create(array_merge([
        'value' => 'Small',
        'code' => 'S',
        'sort_order' => 0,
        'is_active' => true,
    ], $overrides));
}

test('admin can create an attribute value', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $attribute = makeAttribute();

    $this->post(route('attributes.values.store', $attribute), [
        'value' => 'Medium',
        'code' => 'M',
        'sort_order' => 1,
        'is_active' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('attribute_values', [
        'attribute_id' => $attribute->id,
        'value' => 'Medium',
        'code' => 'M',
    ]);
});

test('storing an attribute value requires the value field', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $attribute = makeAttribute();

    $this->post(route('attributes.values.store', $attribute), [
        'code' => 'X',
    ])->assertSessionHasErrors('value');
});

test('admin can update an attribute value', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $attribute = makeAttribute();
    $value = makeAttributeValue($attribute, ['value' => 'Small']);

    $this->put(route('attributes.values.update', [$attribute, $value]), [
        'value' => 'Extra Small',
        'code' => 'XS',
    ])->assertRedirect();

    $this->assertDatabaseHas('attribute_values', [
        'id' => $value->id,
        'value' => 'Extra Small',
        'code' => 'XS',
    ]);
});

test('admin cannot update an attribute value that belongs to another attribute', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $attribute = makeAttribute();
    $otherAttribute = makeAttribute(['name' => 'Color']);
    $value = makeAttributeValue($otherAttribute);

    $this->put(route('attributes.values.update', [$attribute, $value]), [
        'value' => 'Blocked',
    ])->assertNotFound();
});

test('admin can delete an attribute value and it detaches from variants', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $attribute = makeAttribute();
    $value = makeAttributeValue($attribute);
    $product = Product::factory()->create();
    $variant = Variant::factory()->create(['product_id' => $product->id]);
    $variant->attributeValues()->attach($value->id);

    $this->delete(route('attributes.values.destroy', [$attribute, $value]))
        ->assertRedirect();

    $this->assertSoftDeleted('attribute_values', ['id' => $value->id]);
    $this->assertDatabaseMissing('variant_attributes', [
        'variant_id' => $variant->id,
        'attribute_value_id' => $value->id,
    ]);
});

test('admin cannot delete an attribute value belonging to another attribute', function () {
    $user = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($user);
    $attribute = makeAttribute();
    $otherAttribute = makeAttribute(['name' => 'Color']);
    $value = makeAttributeValue($otherAttribute);

    $this->delete(route('attributes.values.destroy', [$attribute, $value]))
        ->assertNotFound();
});

test('non-admin cannot create attribute values', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $attribute = makeAttribute();

    $this->post(route('attributes.values.store', $attribute), [
        'value' => 'Sneaky',
    ])->assertForbidden();
});
