<?php

declare(strict_types=1);

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Occasion;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
    Storage::fake('public');
});

function createStoreCustomer(array $attributes = []): Customer
{
    return Customer::query()->create(array_merge([
        'first_name' => 'Test',
        'last_name' => 'Customer',
        'email' => fake()->unique()->safeEmail(),
        'phone' => '08000000000',
        'is_active' => true,
    ], $attributes));
}

function createSoldOrder(Product $product, array $orderAttributes = []): Order
{
    $customer = createStoreCustomer();

    $order = Order::query()->create(array_merge([
        'order_number' => 'ORD-'.strtoupper(substr(uniqid(), -6)),
        'customer_id' => $customer->id,
        'status' => 'confirmed',
        'payment_status' => 'paid',
        'subtotal' => 150,
        'tax_amount' => 0,
        'discount_amount' => 0,
        'shipping_amount' => 0,
        'total' => 150,
        'fulfillment_type' => 'pickup',
        'placed_at' => now(),
    ], $orderAttributes));

    OrderItem::query()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => $product->name,
        'quantity' => 3,
        'unit_price' => $product->selling_price,
        'tax_amount' => 0,
        'discount_amount' => 0,
        'total' => 150,
        'status' => 'pending',
    ]);

    return $order;
}

function createAdmin(): User
{
    return User::factory()->create([
        'permissions' => ['*'],
    ]);
}

test('homepage uses dynamic occasion, bestseller, testimonial, gallery, and blog data', function (): void {
    $category = Category::factory()->create();

    $manualProduct = Product::factory()->create([
        'category_id' => $category->id,
        'is_active' => true,
        'is_online_visible' => true,
        'best_seller_enabled' => true,
        'best_seller_rank' => 1,
    ]);

    $salesProduct = Product::factory()->create([
        'category_id' => $category->id,
        'is_active' => true,
        'is_online_visible' => true,
    ]);

    createSoldOrder($salesProduct);

    $occasion = Occasion::query()->create([
        'name' => 'Birthday',
        'slug' => 'birthday',
        'description' => 'Birthday balloons and celebration sets.',
        'sort_order' => 1,
        'is_active' => true,
    ]);

    $manualProduct->occasions()->attach($occasion->id, [
        'id' => (string) Str::uuid(),
        'sort_order' => 0,
    ]);

    CustomerReview::query()->create([
        'name' => 'Sarah',
        'email' => 'sarah@example.com',
        'rating' => 5,
        'feedback' => 'Beautiful setup and delivery experience.',
        'image_path' => 'reviews/sarah.jpg',
        'status' => 'approved',
        'is_featured' => true,
        'show_in_gallery' => true,
        'approved_at' => now(),
        'occasion_id' => $occasion->id,
    ]);

    BlogPost::query()->create([
        'title' => 'Planning the Perfect Birthday Setup',
        'slug' => 'planning-the-perfect-birthday-setup',
        'excerpt' => 'Simple ideas for birthday balloon styling.',
        'content' => 'Helpful content.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/home')
            ->has('occasions', 1)
            ->has('bestSellers', 2)
            ->where('bestSellers.0.id', $manualProduct->id)
            ->where('bestSellers.1.id', $salesProduct->id)
            ->has('featuredTestimonials', 1)
            ->has('galleryPreview', 1)
            ->has('latestBlogPosts', 1)
        );
});

test('occasion pages only show linked online-visible products', function (): void {
    $category = Category::factory()->create();
    $occasion = Occasion::query()->create([
        'name' => 'Wedding',
        'slug' => 'wedding',
        'description' => 'Wedding event collection',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $visibleProduct = Product::factory()->create([
        'category_id' => $category->id,
        'is_active' => true,
        'is_online_visible' => true,
    ]);

    $hiddenProduct = Product::factory()->create([
        'category_id' => $category->id,
        'is_active' => false,
        'is_online_visible' => true,
    ]);

    $occasion->products()->attach($visibleProduct->id, [
        'id' => (string) Str::uuid(),
        'sort_order' => 0,
    ]);
    $occasion->products()->attach($hiddenProduct->id, [
        'id' => (string) Str::uuid(),
        'sort_order' => 1,
    ]);

    $this->get(route('store.occasions.show', $occasion))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/occasions/show')
            ->where('occasion.id', $occasion->id)
            ->has('products.data', 1)
            ->where('products.data.0.id', $visibleProduct->id)
        );
});

test('public review submissions are stored as pending and hidden from the public list', function (): void {
    $response = $this->post(route('store.reviews.store'), [
        'name' => 'Chioma',
        'email' => 'chioma@example.com',
        'rating' => 5,
        'title' => 'Amazing balloons',
        'feedback' => 'Everything looked great.',
        'image' => UploadedFile::fake()->image('review.jpg'),
    ]);

    $response->assertRedirect();

    $review = CustomerReview::query()->first();

    expect($review)->not->toBeNull()
        ->and($review?->status)->toBe('pending')
        ->and($review?->show_in_gallery)->toBeTrue();

    $this->get(route('store.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/reviews/index')
            ->has('reviews.data', 0)
        );
});

test('admin can approve a submitted review and mark it as featured', function (): void {
    $admin = createAdmin();
    $review = CustomerReview::query()->create([
        'name' => 'Reviewer',
        'email' => 'reviewer@example.com',
        'rating' => 4,
        'feedback' => 'Great work.',
        'status' => 'pending',
        'is_featured' => false,
        'show_in_gallery' => false,
    ]);

    $this->actingAs($admin)
        ->patch(route('reviews.update', $review), [
            'status' => 'approved',
            'is_featured' => true,
            'show_in_gallery' => false,
        ])
        ->assertRedirect(route('reviews.show', $review));

    expect($review->fresh()->status)->toBe('approved')
        ->and($review->fresh()->is_featured)->toBeTrue()
        ->and($review->fresh()->approved_at)->not->toBeNull();
});

test('draft blog posts stay private while published posts are visible', function (): void {
    $publishedPost = BlogPost::query()->create([
        'title' => 'Published Post',
        'slug' => 'published-post',
        'excerpt' => 'Visible excerpt',
        'content' => 'Visible content',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $draftPost = BlogPost::query()->create([
        'title' => 'Draft Post',
        'slug' => 'draft-post',
        'excerpt' => 'Hidden excerpt',
        'content' => 'Hidden content',
        'status' => 'draft',
        'published_at' => null,
    ]);

    $this->get(route('store.blog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/blog/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $publishedPost->id)
        );

    $this->get(route('store.blog.show', $publishedPost))
        ->assertOk();

    $this->get(route('store.blog.show', $draftPost))
        ->assertNotFound();
});
