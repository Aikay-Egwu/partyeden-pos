<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Categories CRUD.
 * Supports hierarchical categories with parent selection.
 */
class AdminCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Category::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->with('parent')
            ->withCount(['children', 'products'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => null,
            // Top-level categories for parent dropdown
            'parents' => Category::whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->safe()->except(['image']));

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $category->update(['image_path' => $path]);
        }

        AuditLog::create([
            'event' => 'created',
            'auditable_type' => Category::class,
            'auditable_id' => $category->id,
            'user_id' => $request->user()?->id,
            'new_values' => $category->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'description' => 'Category created: '.$category->name,
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => $category->load('parent'),
            'parents' => Category::whereNull('parent_id')
                ->where('id', '!=', $category->id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->safe()->except(['image']));

        if ($request->hasFile('image')) {
            // Delete old image if it exists.
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }

            $path = $request->file('image')->store('categories', 'public');
            $category->update(['image_path' => $path]);
        } elseif ($request->input('image_path') === '') {
            // Image was explicitly cleared by the user.
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }

            $category->update(['image_path' => null]);
        }

        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
