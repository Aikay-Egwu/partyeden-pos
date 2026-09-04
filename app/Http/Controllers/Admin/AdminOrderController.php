<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\InventoryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin controller for Orders (list + detail + status workflow).
 * Orders are created via the storefront; admin manages status transitions.
 */
class AdminOrderController extends Controller
{
    /** Valid order statuses and their allowed next transitions. */
    private const STATUS_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'preorder' => ['confirmed', 'cancelled'],
        'confirmed' => ['preparing', 'cancelled'],
        'preparing' => ['ready', 'cancelled'],
        'ready' => ['dispatched', 'cancelled'],
        'dispatched' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function index(Request $request): Response
    {
        $orders = $this->filteredOrdersQuery($request)
            ->with(['customer', 'location'])
            ->withCount('items')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'search', 'fulfillment_type', 'from_date', 'to_date']),
        ]);
    }

    /**
     * Order detail — loads all relations needed by the enhanced show page.
     */
    public function show(Order $order): Response
    {
        $order->load([
            'customer',
            'location',
            'createdBy',
            'deliveryZone',
            'shipments',
            // Items with all customisation + kit details
            'items.product.kitMappings.component',
            'items.variant',
            'items.customizationPrimaryColor',
            'items.customizationSecondaryColor',
            'items.childItems.product',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'statusTransitions' => self::STATUS_TRANSITIONS[$order->status] ?? [],
        ]);
    }

    /**
     * Renders a printable pick list for the order.
     */
    public function print(Order $order): Response
    {
        $order->load([
            'customer',
            'location',
            'deliveryZone',
            'items.product.kitMappings.component',
            'items.variant',
            'items.customizationPrimaryColor',
            'items.customizationSecondaryColor',
            'items.childItems.product',
        ]);

        return Inertia::render('admin/orders/print', [
            'order' => $order,
        ]);
    }

    /**
     * Transition the order to a new status.
     * Fires OrderStatusChanged and triggers inventory operations.
     */
    public function updateStatus(Request $request, Order $order, InventoryService $inventory): RedirectResponse
    {
        $allowedStatuses = self::STATUS_TRANSITIONS[$order->status] ?? [];

        $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', $allowedStatuses)],
        ]);

        $previousStatus = $order->status;
        $newStatus = $request->string('status')->toString();

        $order->status = $newStatus;
        $order->save();

        // Inventory side-effects on key transitions
        if ($newStatus === 'confirmed') {
            $inventory->convertReservationToDeduction($order);
        } elseif ($newStatus === 'cancelled') {
            $inventory->restoreForOrder($order);
        }

        // Fire event so listeners can send status emails
        event(new OrderStatusChanged($order, $previousStatus));

        return back()->with('success', "Order #{$order->order_number} marked as {$newStatus}.");
    }

    public function bulkConfirm(
        Request $request,
        InventoryService $inventory,
    ): RedirectResponse {
        $validated = $request->validate([
            'order_ids' => ['required', 'array'],
            'order_ids.*' => ['required', 'string', 'exists:orders,id'],
        ]);

        $orders = Order::whereIn('id', $validated['order_ids'])
            ->whereIn('status', ['pending', 'preorder'])
            ->get();

        $count = 0;
        foreach ($orders as $order) {
            $previousStatus = $order->status;
            $order->update(['status' => 'confirmed']);
            $inventory->convertReservationToDeduction($order);
            event(new OrderStatusChanged($order, $previousStatus));
            $count++;
        }

        return back()->with('success', "{$count} orders confirmed successfully.");
    }

    public function export(Request $request): StreamedResponse
    {
        $orders = $this->filteredOrdersQuery($request)
            ->with('customer')
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($orders): void {
            $file = fopen('php://output', 'w');

            if ($file === false) {
                return;
            }

            fputcsv($file, [
                'Order Number',
                'Date',
                'Customer',
                'Email',
                'Status',
                'Payment Status',
                'Fulfillment',
                'Delivery Postcode',
                'Total',
                'Notes',
            ]);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->created_at?->toDateTimeString(),
                    $order->customer ? "{$order->customer->first_name} {$order->customer->last_name}" : 'Guest',
                    $order->customer?->email,
                    $order->status,
                    $order->payment_status,
                    $order->fulfillment_type,
                    $order->delivery_postcode,
                    $order->total,
                    $order->notes,
                ]);
            }

            fclose($file);
        }, 'orders_export_'.now()->format('Ymd_His').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function filteredOrdersQuery(Request $request): Builder
    {
        /** @var string|null $search */
        $search = $request->string('search')->trim()->toString() ?: null;

        return Order::query()
            ->when($request->filled('status'), fn (Builder $query): Builder => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('payment_status'), fn (Builder $query): Builder => $query->where('payment_status', $request->string('payment_status')->toString()))
            ->when($request->filled('fulfillment_type'), fn (Builder $query): Builder => $query->where('fulfillment_type', $request->string('fulfillment_type')->toString()))
            ->when($request->filled('from_date'), fn (Builder $query): Builder => $query->whereDate('created_at', '>=', $request->string('from_date')->toString()))
            ->when($request->filled('to_date'), fn (Builder $query): Builder => $query->whereDate('created_at', '<=', $request->string('to_date')->toString()))
            ->when($search !== null, function (Builder $query) use ($search): Builder {
                return $query->where(function (Builder $nestedQuery) use ($search): void {
                    $nestedQuery->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function (Builder $customerQuery) use ($search): void {
                            $customerQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            });
    }
}
