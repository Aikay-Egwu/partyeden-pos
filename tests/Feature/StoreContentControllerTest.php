<?php

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\CustomerReview;
use App\Models\Occasion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

// ── Home ─────────────────────────────────────────────────────────────

test('home page renders', function () {
    $this->get(route('home'))->assertOk();
});

// ── Blog ─────────────────────────────────────────────────────────────

test('blog index renders and lists published posts', function () {
    BlogPost::factory()->published()->create(['title' => 'Party Tips']);
    BlogPost::factory()->create(['title' => 'Draft Post']); // draft, hidden

    $this->get(route('store.blog.index'))
        ->assertOk()
        ->assertSee('Party Tips')
        ->assertDontSee('Draft Post');
});

test('published blog post can be viewed by slug', function () {
    $post = BlogPost::factory()->published()->create();

    $this->get(route('store.blog.show', $post->slug))->assertOk();
});

test('draft blog post returns 404', function () {
    $post = BlogPost::factory()->create(); // status stays draft

    $this->get(route('store.blog.show', $post->slug))->assertNotFound();
});

// ── Categories ───────────────────────────────────────────────────────

test('category page renders with sub-categories', function () {
    $category = Category::factory()->create();
    Category::factory()->create(['parent_id' => $category->id]);

    $this->get(route('store.categories.show', $category->id))->assertOk();
});

// ── Occasions ────────────────────────────────────────────────────────

test('occasions index renders active occasions', function () {
    Occasion::factory()->create(['name' => 'Birthday Bash']);

    $this->get(route('store.occasions.index'))
        ->assertOk()
        ->assertSee('Birthday Bash');
});

test('active occasion can be viewed by slug', function () {
    $occasion = Occasion::factory()->create();

    $this->get(route('store.occasions.show', $occasion->slug))->assertOk();
});

test('inactive occasion returns 404', function () {
    $occasion = Occasion::factory()->create(['is_active' => false]);

    $this->get(route('store.occasions.show', $occasion->slug))->assertNotFound();
});

// ── Reviews & gallery ────────────────────────────────────────────────

test('reviews index and gallery render', function () {
    CustomerReview::factory()->approved()->create();

    $this->get(route('store.reviews.index'))->assertOk();
    $this->get(route('store.gallery.index'))->assertOk();
});

test('visitors can submit a review which starts as pending', function () {
    $this->from(route('store.reviews.index'))
        ->post(route('store.reviews.store'), [
            'name' => 'Happy Customer',
            'email' => 'happy@example.com',
            'rating' => 5,
            'feedback' => 'Great decorations, thank you!',
        ])
        ->assertRedirect(route('store.reviews.index'))
        ->assertSessionHas('success');

    // Reviews always await moderation before showing publicly
    $this->assertDatabaseHas('customer_reviews', [
        'email' => 'happy@example.com',
        'status' => 'pending',
        'is_featured' => false,
    ]);
});

test('review submission with a photo stores the image for the gallery', function () {
    Storage::fake('public');

    $this->post(route('store.reviews.store'), [
        'name' => 'Photo Fan',
        'email' => 'photo@example.com',
        'rating' => 4,
        'feedback' => 'Look at our setup!',
        'image' => UploadedFile::fake()->image('party.jpg'),
    ])->assertRedirect();

    $review = CustomerReview::firstOrFail();
    expect($review->image_path)->not->toBeNull()
        ->and((bool) $review->show_in_gallery)->toBeTrue();
    Storage::disk('public')->assertExists($review->image_path);
});

test('review submission validates required fields', function () {
    $this->from(route('store.reviews.index'))
        ->post(route('store.reviews.store'), [
            'rating' => 9, // out of range
        ])
        ->assertSessionHasErrors(['name', 'email', 'rating', 'feedback']);

    $this->assertDatabaseCount('customer_reviews', 0);
});
