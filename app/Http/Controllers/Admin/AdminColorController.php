<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Colors CRUD.
 *
 * Colors are used for product customization — customers pick
 * primary/secondary colors from the colors the admin defines here.
 */
class AdminColorController extends Controller
{
    // Paginated list
    public function index(Request $request): Response
    {
        $colors = Color::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/colors/index', [
            'colors' => $colors,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    // Create form
    public function create(): Response
    {
        return Inertia::render('admin/colors/form', [
            'color' => null,
        ]);
    }

    // Store new color
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:colors,name'],
            'hex_code' => ['nullable', 'string', 'max:7'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $color = Color::create($request->only(['name', 'hex_code', 'is_active']));

        AuditLog::create([
            'event' => 'created',
            'auditable_type' => Color::class,
            'auditable_id' => $color->id,
            'user_id' => $request->user()?->id,
            'new_values' => $color->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'description' => 'Color created: '.$color->name,
        ]);

        return redirect()->route('colors.index')
            ->with('success', 'Color created successfully.');
    }

    // Edit form
    public function edit(Color $color): Response
    {
        return Inertia::render('admin/colors/form', [
            'color' => $color,
        ]);
    }

    // Update color
    public function update(Request $request, Color $color)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:colors,name,'.$color->id],
            'hex_code' => ['nullable', 'string', 'max:7'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $color->update($request->only(['name', 'hex_code', 'is_active']));

        return redirect()->route('colors.index')
            ->with('success', 'Color updated successfully.');
    }

    // Soft delete
    public function destroy(Color $color)
    {
        $color->delete();

        return redirect()->route('colors.index')
            ->with('success', 'Color deleted successfully.');
    }
}
