<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin CRUD for DeliveryZone, including inline postcode prefix management.
 */
class AdminDeliveryZoneController extends Controller
{
    public function index(): Response
    {
        $zones = DeliveryZone::withCount('prefixes')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('admin/delivery-zones/index', [
            'zones' => $zones,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/delivery-zones/form', [
            'zone' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'delivery_price' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000',
            'prefixes' => 'nullable|array',
            'prefixes.*' => 'string|max:10',
        ]);

        DB::transaction(function () use ($data) {
            $zone = DeliveryZone::create([
                'name' => $data['name'],
                'delivery_price' => $data['delivery_price'],
                'min_order_amount' => $data['min_order_amount'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->syncPrefixes($zone, $data['prefixes'] ?? []);
        });

        return redirect()->route('admin.delivery-zones.index')
            ->with('success', 'Delivery zone created.');
    }

    public function edit(DeliveryZone $deliveryZone): Response
    {
        $deliveryZone->load('prefixes');

        return Inertia::render('admin/delivery-zones/form', [
            'zone' => $deliveryZone,
        ]);
    }

    public function update(Request $request, DeliveryZone $deliveryZone): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'delivery_price' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:1000',
            'prefixes' => 'nullable|array',
            'prefixes.*' => 'string|max:10',
        ]);

        DB::transaction(function () use ($data, $deliveryZone) {
            $deliveryZone->update([
                'name' => $data['name'],
                'delivery_price' => $data['delivery_price'],
                'min_order_amount' => $data['min_order_amount'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->syncPrefixes($deliveryZone, $data['prefixes'] ?? []);
        });

        return redirect()->route('admin.delivery-zones.index')
            ->with('success', 'Delivery zone updated.');
    }

    public function destroy(DeliveryZone $deliveryZone): RedirectResponse
    {
        // Remove prefixes before deleting the zone
        $deliveryZone->prefixes()->delete();
        $deliveryZone->delete();

        return redirect()->route('admin.delivery-zones.index')
            ->with('success', 'Delivery zone deleted.');
    }

    /**
     * Sync postcode prefix rows: delete removed ones, insert new ones.
     *
     * @param  array<int, string>  $prefixes
     */
    private function syncPrefixes(DeliveryZone $zone, array $prefixes): void
    {
        // Normalise: uppercase, trim whitespace
        $incoming = collect($prefixes)
            ->map(fn (string $p) => strtoupper(trim($p)))
            ->filter()
            ->unique()
            ->values();

        $existing = $zone->prefixes()->pluck('code_prefix');

        $toDelete = $existing->diff($incoming);
        $toInsert = $incoming->diff($existing);

        if ($toDelete->isNotEmpty()) {
            DeliveryZonePostcodePrefix::where('delivery_zone_id', $zone->id)
                ->whereIn('code_prefix', $toDelete)
                ->delete();
        }

        foreach ($toInsert as $prefix) {
            DeliveryZonePostcodePrefix::create([
                'delivery_zone_id' => $zone->id,
                'code_prefix' => $prefix,
            ]);
        }
    }
}
