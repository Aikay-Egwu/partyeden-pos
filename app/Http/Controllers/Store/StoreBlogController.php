<?php

declare(strict_types=1);

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreBlogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/blog/index', [
            'posts' => BlogPost::query()
                ->published()
                ->with('author')
                ->latest('published_at')
                ->paginate(9)
                ->withQueryString()
                ->through(fn (BlogPost $blogPost) => [
                    'id' => $blogPost->id,
                    'title' => $blogPost->title,
                    'slug' => $blogPost->slug,
                    'excerpt' => $blogPost->excerpt,
                    'cover_image' => $blogPost->cover_image_path ? Storage::url($blogPost->cover_image_path) : null,
                    'published_at' => $blogPost->published_at?->toFormattedDateString(),
                    'author' => $blogPost->author?->only(['id', 'name']),
                ]),
        ]);
    }

    public function show(BlogPost $blogPost): Response
    {
        abort_unless($blogPost->status === 'published' && $blogPost->published_at !== null, 404);

        $blogPost->load('author');

        return Inertia::render('store/blog/show', [
            'post' => [
                'id' => $blogPost->id,
                'title' => $blogPost->title,
                'slug' => $blogPost->slug,
                'excerpt' => $blogPost->excerpt,
                'content' => $blogPost->content,
                'cover_image' => $blogPost->cover_image_path ? Storage::url($blogPost->cover_image_path) : null,
                'published_at' => $blogPost->published_at?->toFormattedDateString(),
                'author' => $blogPost->author?->only(['id', 'name']),
            ],
        ]);
    }
}
