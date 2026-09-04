<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\TillSession\CloseTillSessionRequest;
use App\Http\Requests\TillSession\OpenTillSessionRequest;
use App\Http\Resources\TillSessionResource;
use App\Models\TillSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TillSessionController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', TillSession::class);

        $sessions = TillSession::query()
            ->when($request->input('staff_id'), fn ($q, $id) => $q->where('staff_id', $id))
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id))
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('from'), fn ($q, $d) => $q->whereDate('opened_at', '>=', $d))
            ->when($request->input('to'), fn ($q, $d) => $q->whereDate('opened_at', '<=', $d))
            ->with(['staff', 'location'])
            ->withCount('transactions')
            ->latest('opened_at')
            ->paginate($request->integer('per_page', 15));

        return TillSessionResource::collection($sessions);
    }

    public function show(TillSession $tillSession): TillSessionResource
    {
        $this->authorize('view', $tillSession);

        $tillSession->load(['staff', 'location'])->loadCount('transactions');

        return new TillSessionResource($tillSession);
    }

    public function open(OpenTillSessionRequest $request): TillSessionResource
    {
        $this->authorize('create', TillSession::class);

        $session = TillSession::create(array_merge(
            $request->validated(),
            [
                'opened_at' => now(),
                'status' => 'open',
                'cash_sales' => 0,
            ]
        ));

        return new TillSessionResource($session->load(['staff', 'location']));
    }

    public function close(CloseTillSessionRequest $request, TillSession $tillSession): TillSessionResource
    {
        $this->authorize('update', $tillSession);

        $closingBalance = (float) $request->validated('closing_balance');
        $expectedBalance = (float) $tillSession->opening_balance + (float) $tillSession->cash_sales;

        $tillSession->update([
            'closed_at' => now(),
            'closing_balance' => $closingBalance,
            'expected_balance' => $expectedBalance,
            'status' => 'closed',
            'notes' => $request->validated('notes'),
        ]);

        return new TillSessionResource($tillSession->refresh()->load(['staff', 'location'])->loadCount('transactions'));
    }

    public function current(Request $request): TillSessionResource
    {
        $this->authorize('viewAny', TillSession::class);

        $session = TillSession::where('staff_id', $request->input('staff_id'))
            ->where('status', 'open')
            ->with(['staff', 'location'])
            ->withCount('transactions')
            ->firstOrFail();

        return new TillSessionResource($session);
    }
}
