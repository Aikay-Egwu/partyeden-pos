<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TillSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin controller for Till Sessions (read-only list + detail).
 * Till sessions are opened/closed via POS operations.
 */
class AdminTillSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = TillSession::query()
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['staff', 'location'])
            ->withCount('transactions')
            ->latest('opened_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/till-sessions/index', [
            'sessions' => $sessions,
            'filters' => $request->only(['status']),
        ]);
    }

    public function show(TillSession $tillSession): Response
    {
        return Inertia::render('admin/till-sessions/index', [
            'sessions' => ['data' => [$tillSession->load(['staff', 'location', 'transactions.staff'])]],
            'filters' => [],
        ]);
    }
}
