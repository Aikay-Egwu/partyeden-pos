<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\ReturnModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin controller for Returns (list + detail + status workflow + optional restock).
 */
class AdminReturnController extends Controller
{
    /** Allowed forward transitions for each return status. */
    private const array STATUS_TRANSITIONS = [
        'pending' => ['approved', 'rejected'],
        'approved' => ['received', 'rejected'],
        'received' => ['refunded'],
        'refunded' => [],
        'rejected' => [],
    ];

    public function index(Request $request): Response
    {
        $returns = ReturnModel::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['transaction', 'customer', 'staff', 'location'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/returns/index', [
            'returns' => $returns,
            'filters' => $request->only(['status']),
        ]);
    }

    /** Detail view with returned items and available status transitions. */
    public function show(ReturnModel $return): Response
    {
        return Inertia::render('admin/returns/show', [
            'return' => $return->load([
                'transaction', 'customer', 'staff', 'location',
                'processedBy', 'items.product',
            ]),
            'statusTransitions' => self::STATUS_TRANSITIONS[$return->status] ?? [],
        ]);
    }

    /**
     * Transition a return to a new status.
     * On approval, sets processed_by / processed_at.
     */
    public function updateStatus(Request $request, ReturnModel $return): RedirectResponse
    {
        $allowedStatuses = self::STATUS_TRANSITIONS[$return->status] ?? [];

        $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', $allowedStatuses)],
        ]);

        $newStatus = $request->string('status')->toString();

        $return->status = $newStatus;

        if (in_array($newStatus, ['approved', 'received', 'refunded', 'rejected'], true)) {
            $return->processed_by = $request->user()?->id;
            $return->processed_at = now();
        }

        $return->save();

        return back()->with('success', "Return marked as {$newStatus}.");
    }

    /**
     * Add an inventory movement to restock items from a received return.
     * Can only be called when the return is in 'received' status.
     */
    public function restock(Request $request, ReturnModel $return): RedirectResponse
    {
        if ($return->status !== 'received') {
            return back()->with('error', 'Can only restock items from a received return.');
        }

        $request->validate([
            'location_id' => 'required|uuid|exists:locations,id',
        ]);

        $locationId = $request->string('location_id')->toString();

        DB::transaction(function () use ($return, $locationId) {
            $return->load('items.product');

            foreach ($return->items as $item) {
                if (! $item->product || ! $item->product->track_inventory) {
                    continue;
                }

                // Create a positive inventory movement (stock in)
                InventoryMovement::create([
                    'product_id' => $item->product_id,
                    'variant_id' => null,
                    'location_id' => $locationId,
                    'quantity' => abs((float) $item->quantity),
                    'type' => 'return',
                    'reference_type' => ReturnModel::class,
                    'reference_id' => $return->id,
                    'reason' => "Return #{$return->return_number} — stock restocked",
                ]);
            }
        });

        return back()->with('success', 'Items restocked to inventory.');
    }
}
