<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBalance;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin controller for Inventory Balances (read-only list + adjustment).
 * Shows stock levels per product/location with manual adjustment capability.
 */
class AdminInventoryController extends Controller
{
    // List inventory balances with filters
    public function index(Request $request): Response
    {
        $balances = InventoryBalance::query()
            ->when($request->product_id, fn ($q, $id) => $q->where('product_id', $id))
            ->when($request->location_id, fn ($q, $id) => $q->where('location_id', $id))
            ->with(['product', 'location'])
            ->orderBy('product_id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/inventory/index', [
            'balances' => $balances,
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'locations' => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['product_id', 'location_id']),
        ]);
    }

    // Show adjustment form for a specific balance
    public function adjust(string $id): Response
    {
        $balance = InventoryBalance::with(['product', 'location'])->findOrFail($id);

        return Inertia::render('admin/inventory/adjust', [
            'balance' => $balance,
        ]);
    }

    // Store a manual inventory adjustment
    public function storeAdjustment(Request $request, string $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric',
            'reason' => 'required|string|max:255',
        ]);

        $balance = InventoryBalance::findOrFail($id);
        $balance->update(['quantity' => $validated['quantity']]);

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory adjusted successfully.');
    }
}
