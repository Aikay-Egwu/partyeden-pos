<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin controller for Transactions (read-only list + detail view).
 * Transactions are created via POS, not the admin panel.
 */
class AdminTransactionController extends Controller
{
    // List with date/status filters
    public function index(Request $request): Response
    {
        $transactions = Transaction::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->date_from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->with(['staff', 'customer', 'location'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }

    // Detail view with items and payments
    public function show(Transaction $transaction): Response
    {
        return Inertia::render('admin/transactions/show', [
            'transaction' => $transaction->load([
                'staff', 'customer', 'location',
                'items.product', 'payments', 'discount',
            ]),
        ]);
    }
}
