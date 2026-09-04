<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Component;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminComponentController extends Controller
{
    public function index(Request $request): Response
    {
        $components = Component::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%");
            }))
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/components/index', [
            'components' => $components,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/components/form', [
            'component' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:components,sku'],
            'cost_price' => ['sometimes', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $component = Component::create($validated);

        AuditLog::create([
            'event' => 'created',
            'auditable_type' => Component::class,
            'auditable_id' => $component->id,
            'user_id' => $request->user()?->id,
            'new_values' => $component->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'description' => 'Component created: '.$component->name,
        ]);

        return redirect()->route('components.index')
            ->with('success', 'Component created successfully.');
    }

    public function edit(Component $component): Response
    {
        return Inertia::render('admin/components/form', [
            'component' => $component,
        ]);
    }

    public function update(Request $request, Component $component)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:components,sku,'.$component->id],
            'cost_price' => ['sometimes', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $component->update($validated);

        return redirect()->route('components.index')
            ->with('success', 'Component updated successfully.');
    }

    public function destroy(Component $component)
    {
        // When deleting a component, optionally delete kit mappings.
        // We'll rely on the soft delete for now.
        $component->delete();

        return redirect()->route('components.index')
            ->with('success', 'Component deleted successfully.');
    }
}
