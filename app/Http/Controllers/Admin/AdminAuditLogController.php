<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin controller for Audit Logs (read-only).
 * Displays system-wide audit trail for compliance and debugging.
 */
class AdminAuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = AuditLog::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('event', 'like', "%{$s}%")
                    ->orWhere('auditable_type', 'like', "%{$s}%");
            }))
            ->with('user')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/audit-logs/index', [
            'logs' => $logs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(AuditLog $auditLog): Response
    {
        return Inertia::render('admin/audit-logs/show', [
            'log' => $auditLog->load('user'),
        ]);
    }
}
