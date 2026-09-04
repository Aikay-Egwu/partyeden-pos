<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaxCategory\StoreTaxCategoryRequest;
use App\Http\Requests\TaxCategory\UpdateTaxCategoryRequest;
use App\Models\TaxCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Tax Categories CRUD.
 * Simple name + rate management for tax configurations.
 */
class AdminTaxCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $taxCategories = TaxCategory::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/tax-categories/index', [
            'taxCategories' => $taxCategories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/tax-categories/form', ['taxCategory' => null]);
    }

    public function store(StoreTaxCategoryRequest $request)
    {
        TaxCategory::create($request->validated());

        return redirect()->route('tax-categories.index')
            ->with('success', 'Tax category created successfully.');
    }

    public function edit(TaxCategory $taxCategory): Response
    {
        return Inertia::render('admin/tax-categories/form', ['taxCategory' => $taxCategory]);
    }

    public function update(UpdateTaxCategoryRequest $request, TaxCategory $taxCategory)
    {
        $taxCategory->update($request->validated());

        return redirect()->route('tax-categories.index')
            ->with('success', 'Tax category updated successfully.');
    }

    public function destroy(TaxCategory $taxCategory)
    {
        $taxCategory->delete();

        return redirect()->route('tax-categories.index')
            ->with('success', 'Tax category deleted successfully.');
    }
}
