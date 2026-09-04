<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shipment\StoreShipmentRequest;
use App\Http\Requests\Shipment\UpdateShipmentRequest;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Shipments CRUD.
 */
class AdminShipmentController extends Controller
{
    public function index(Request $request): Response
    {
        $shipments = Shipment::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with('order')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/shipments/index', [
            'shipments' => $shipments,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/shipments/form', ['shipment' => null]);
    }

    public function store(StoreShipmentRequest $request)
    {
        Shipment::create($request->validated());

        return redirect()->route('shipments.index')
            ->with('success', 'Shipment created successfully.');
    }

    public function edit(Shipment $shipment): Response
    {
        return Inertia::render('admin/shipments/form', [
            'shipment' => $shipment->load('order'),
        ]);
    }

    public function update(UpdateShipmentRequest $request, Shipment $shipment)
    {
        $shipment->update($request->validated());

        return redirect()->route('shipments.index')
            ->with('success', 'Shipment updated successfully.');
    }

    public function destroy(Shipment $shipment)
    {
        $shipment->delete();

        return redirect()->route('shipments.index')
            ->with('success', 'Shipment deleted successfully.');
    }
}
