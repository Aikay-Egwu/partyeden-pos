<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', AuditLog::class);

        $logs = AuditLog::query()
            ->when($request->input('event'), fn ($q, $e) => $q->where('event', $e))
            ->when($request->input('auditable_type'), fn ($q, $t) => $q->where('auditable_type', $t))
            ->when($request->input('auditable_id'), fn ($q, $id) => $q->where('auditable_id', $id))
            ->when($request->input('user_id'), fn ($q, $id) => $q->where('user_id', $id))
            ->when($request->input('from'), fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->input('to'), fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->with('user')
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return AuditLogResource::collection($logs);
    }

    public function show(AuditLog $auditLog): AuditLogResource
    {
        $this->authorize('view', $auditLog);

        $auditLog->load('user');

        return new AuditLogResource($auditLog);
    }
}
