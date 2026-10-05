<?php

use App\Models\Faq;
use App\Models\User;
use Database\Seeders\FaqSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('public faq page lists visible entries by season only', function () {
    $winterFaq = Faq::query()->create([
        'question' => 'What happens in cold weather?',
        'answer' => 'Helium contracts in cold air.',
        'category' => 'winter',
        'sort_order' => 10,
        'is_visible' => true,
    ]);
    Faq::query()->create([
        'question' => 'Hidden answer',
        'answer' => 'This should stay private.',
        'category' => 'summer',
        'sort_order' => 20,
        'is_visible' => false,
    ]);

    $this->get(route('store.faqs.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('store/faqs/index')
            ->has('faqs.winter', 1)
            ->where('faqs.winter.0.id', $winterFaq->id)
            ->has('faqs.summer', 0)
            ->has('faqs.general', 0)
        )
        ->assertDontSee('Hidden answer');
});

test('only admins can manage faqs', function () {
    $this->get(route('faqs.index'))->assertRedirect(route('login'));

    $user = User::factory()->create(['permissions' => []]);

    $this->actingAs($user)->get(route('faqs.index'))->assertForbidden();
});

test('admin can create and edit a faq', function () {
    $admin = User::factory()->create(['permissions' => ['admin']]);
    $this->actingAs($admin);

    $this->post(route('faqs.store'), [
        'question' => 'Can balloons be stored in a hot car?',
        'answer' => 'No, keep them in a cool place.',
        'category' => 'summer',
        'sort_order' => 5,
        'is_visible' => true,
    ])->assertRedirect(route('faqs.index'));

    $faq = Faq::query()->firstOrFail();

    $this->put(route('faqs.update', $faq), [
        'question' => 'Can helium balloons be stored in a hot car?',
        'answer' => 'No. A parked car can heat up quickly.',
        'category' => 'summer',
        'sort_order' => 7,
        'is_visible' => false,
    ])->assertRedirect(route('faqs.index'));

    $this->assertDatabaseHas('faqs', [
        'id' => $faq->id,
        'question' => 'Can helium balloons be stored in a hot car?',
        'sort_order' => 7,
        'is_visible' => false,
    ]);
});

test('faq creation validates content and category', function () {
    $admin = User::factory()->create(['permissions' => ['admin']]);

    $this->actingAs($admin)
        ->from(route('faqs.create'))
        ->post(route('faqs.store'), [
            'question' => '',
            'answer' => '',
            'category' => 'spring',
            'sort_order' => -1,
            'is_visible' => 'not-a-boolean',
        ])
        ->assertSessionHasErrors([
            'question',
            'answer',
            'category',
            'sort_order',
            'is_visible',
        ]);
});

test('admin can hide and delete a faq', function () {
    $admin = User::factory()->create(['permissions' => ['admin']]);
    $faq = Faq::query()->create([
        'question' => 'How do I keep balloons safe?',
        'answer' => 'Store them indoors.',
        'category' => 'general',
        'sort_order' => 0,
        'is_visible' => true,
    ]);
    $this->actingAs($admin);

    $this->patch(route('faqs.visibility.update', $faq), [
        'is_visible' => false,
    ])->assertRedirect();

    $this->assertDatabaseHas('faqs', [
        'id' => $faq->id,
        'is_visible' => false,
    ]);

    $this->delete(route('faqs.destroy', $faq))
        ->assertRedirect(route('faqs.index'));

    $this->assertSoftDeleted('faqs', ['id' => $faq->id]);
});

test('faq seeder can be run repeatedly without duplicating questions', function () {
    $this->seed(FaqSeeder::class);
    $this->seed(FaqSeeder::class);

    expect(Faq::query()->count())->toBe(8);
});
