<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BlogPost\StoreBlogPostRequest;
use App\Http\Requests\BlogPost\UpdateBlogPostRequest;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminBlogPostController extends Controller
{
    public function index(Request $request): Response
    {
        $posts = BlogPost::query()
            ->with('author')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/blog-posts/index', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/blog-posts/form', [
            'blogPost' => null,
        ]);
    }

    public function store(StoreBlogPostRequest $request)
    {
        $data = $request->safe()->except(['cover_image']);

        if ($request->hasFile('cover_image')) {
            $data['cover_image_path'] = $request->file('cover_image')->store('blog-posts', 'public');
        }

        $data['author_id'] = $request->user()?->id;
        $data['published_at'] = $data['status'] === 'published' ? now() : null;

        BlogPost::create($data);

        return redirect()->route('blog-posts.index')
            ->with('success', 'Blog post created successfully.');
    }

    public function edit(BlogPost $blog_post): Response
    {
        return Inertia::render('admin/blog-posts/form', [
            'blogPost' => $blog_post,
        ]);
    }

    public function update(UpdateBlogPostRequest $request, BlogPost $blog_post)
    {
        $data = $request->safe()->except(['cover_image']);

        if ($request->hasFile('cover_image')) {
            if ($blog_post->cover_image_path) {
                Storage::disk('public')->delete($blog_post->cover_image_path);
            }

            $data['cover_image_path'] = $request->file('cover_image')->store('blog-posts', 'public');
        } elseif ($request->input('cover_image_path') === '') {
            if ($blog_post->cover_image_path) {
                Storage::disk('public')->delete($blog_post->cover_image_path);
            }

            $data['cover_image_path'] = null;
        }

        if (($data['status'] ?? $blog_post->status) === 'published') {
            $data['published_at'] = $blog_post->published_at ?? now();
        } else {
            $data['published_at'] = null;
        }

        $blog_post->update($data);

        return redirect()->route('blog-posts.index')
            ->with('success', 'Blog post updated successfully.');
    }

    public function destroy(BlogPost $blog_post)
    {
        if ($blog_post->cover_image_path) {
            Storage::disk('public')->delete($blog_post->cover_image_path);
        }

        $blog_post->delete();

        return redirect()->route('blog-posts.index')
            ->with('success', 'Blog post deleted successfully.');
    }
}
