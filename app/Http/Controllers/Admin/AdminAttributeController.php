<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attribute\StoreAttributeRequest;
use App\Http\Requests\Attribute\UpdateAttributeRequest;
use App\Models\Attribute;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Attributes CRUD.
 * Attributes define product options like Size, Color, Material.
 */
class AdminAttributeController extends Controller
{
    public function index(Request $request): Response
    {
        $attributes = Attribute::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->withCount('values')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/attributes/index', [
            'attributes' => $attributes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/attributes/form', ['attribute' => null]);
    }

    public function store(StoreAttributeRequest $request)
    {
        Attribute::create($request->validated());

        return redirect()->route('attributes.index')
            ->with('success', 'Attribute created successfully.');
    }

    public function edit(Attribute $attribute): Response
    {
        $attribute->load(['values' => fn ($q) => $q->orderBy('sort_order')->orderBy('value')]);

        return Inertia::render('admin/attributes/form', [
            'attribute' => $attribute,
        ]);
    }

    public function update(UpdateAttributeRequest $request, Attribute $attribute)
    {
        $attribute->update($request->validated());

        return redirect()->route('attributes.index')
            ->with('success', 'Attribute updated successfully.');
    }

    public function destroy(Attribute $attribute)
    {
        $attribute->delete();

        return redirect()->route('attributes.index')
            ->with('success', 'Attribute deleted successfully.');
    }
}
