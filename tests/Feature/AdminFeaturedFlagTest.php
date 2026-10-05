<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Occasion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function featuredFlagAdmin(): User
{
    return User::factory()->create(['permissions' => ['*']]);
}

test('admin can set featured when creating and updating a category', function (): void {
    $this->actingAs(featuredFlagAdmin());

    $response = $this->post(route('categories.store'), [
        'name' => 'Birthday Balloons',
        'slug' => 'birthday-balloons',
        'is_active' => '1',
        'featured' => '1',
    ]);

    $category = Category::where('slug', 'birthday-balloons')->firstOrFail();
    $response->assertRedirect();
    expect($category->featured)->toBeTrue();

    // Turning the flag off must persist too (safe() would drop it otherwise).
    $this->put(route('categories.update', $category), [
        'name' => $category->name,
        'is_active' => '1',
        'featured' => '0',
    ]);

    expect($category->fresh()->featured)->toBeFalse();
});

test('admin can set featured when creating and updating an occasion', function (): void {
    $this->actingAs(featuredFlagAdmin());

    $response = $this->post(route('occasions.store'), [
        'name' => 'Wedding',
        'slug' => 'wedding',
        'is_active' => '1',
        'featured' => '1',
    ]);

    $occasion = Occasion::where('slug', 'wedding')->firstOrFail();
    $response->assertRedirect();
    expect($occasion->featured)->toBeTrue();

    $this->put(route('occasions.update', $occasion), [
        'name' => $occasion->name,
        'is_active' => '1',
        'featured' => '0',
    ]);

    expect($occasion->fresh()->featured)->toBeFalse();
});

test('featured defaults to false when not supplied', function (): void {
    $this->actingAs(featuredFlagAdmin());

    $this->post(route('categories.store'), [
        'name' => 'Plain Category',
        'slug' => 'plain-category',
        'is_active' => '1',
    ]);

    expect(Category::where('slug', 'plain-category')->firstOrFail()->featured)->toBeFalse();
});
