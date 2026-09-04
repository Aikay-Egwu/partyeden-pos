<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockReservation\StoreStockReservationRequest;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockReservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Stock Reservations.
 * Manage reservations with release/extend actions.
 */
class AdminStockReservationController extends Controller
{
    public function index(Request $request): Response
    {
        $reservations = StockReservation::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['product', 'location', 'order'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/stock-reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/stock-reservations/form', [
            'reservation' => null,
            'products' => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
            'locations' => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreStockReservationRequest $request)
    {
        StockReservation::create($request->validated());

        return redirect()->route('stock-reservations.index')
            ->with('success', 'Reservation created successfully.');
    }

    public function edit(StockReservation $stockReservation): Response
    {
        return Inertia::render('admin/stock-reservations/form', [
            'reservation' => $stockReservation->load(['product', 'location']),
            'products' => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
            'locations' => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, StockReservation $stockReservation)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'expires_at' => 'nullable|date',
        ]);

        $stockReservation->update($validated);

        return redirect()->route('stock-reservations.index')
            ->with('success', 'Reservation updated successfully.');
    }

    public function destroy(StockReservation $stockReservation)
    {
        $stockReservation->delete();

        return redirect()->route('stock-reservations.index')
            ->with('success', 'Reservation deleted successfully.');
    }
}
