<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\ReturnRequest\StoreReturnRequest;
use App\Http\Requests\ReturnRequest\UpdateReturnRequest;
use App\Http\Resources\ReturnResource;
use App\Models\ReturnModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ReturnController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', ReturnModel::class);

        $returns = ReturnModel::query()
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('staff_id'), fn ($q, $id) => $q->where('staff_id', $id))
            ->when($request->input('location_id'), fn ($q, $id) => $q->where('location_id', $id))
            ->when($request->input('transaction_id'), fn ($q, $id) => $q->where('transaction_id', $id))
            ->dateRange($request->input('from'), $request->input('to'))
            ->with(['transaction', 'customer', 'staff', 'location', 'processedBy', 'items'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ReturnResource::collection($returns);
    }

    public function store(StoreReturnRequest $request): ReturnResource
    {
        $this->authorize('create', ReturnModel::class);

        $return = ReturnModel::create(array_merge(
            $request->validated(),
            [
                'return_number' => 'RET-'.strtoupper(Str::random(12)).'-'.now()->format('Ymd'),
                'status' => 'pending',
            ]
        ));

        return new ReturnResource(
            $return->load(['transaction', 'customer', 'staff', 'location', 'items'])
        );
    }

    public function show(ReturnModel $return): ReturnResource
    {
        $this->authorize('view', $return);

        $return->load(['transaction', 'customer', 'staff', 'location', 'processedBy', 'items.product', 'items.variant']);

        return new ReturnResource($return);
    }

    public function update(UpdateReturnRequest $request, ReturnModel $return): ReturnResource
    {
        $this->authorize('update', $return);

        $return->update($request->validated());

        return new ReturnResource($return->load(['transaction', 'customer', 'staff', 'location', 'processedBy', 'items']));
    }

    public function destroy(ReturnModel $return): JsonResponse
    {
        $this->authorize('delete', $return);

        $return->delete();

        return $this->respondDeleted('Return');
    }

    public function approve(ReturnModel $return): ReturnResource
    {
        $this->authorize('update', $return);

        $return->update([
            'status' => 'approved',
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return new ReturnResource($return->load(['transaction', 'customer', 'staff', 'location', 'processedBy', 'items']));
    }

    public function complete(ReturnModel $return): ReturnResource
    {
        $this->authorize('update', $return);

        $return->update([
            'status' => 'completed',
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return new ReturnResource($return->load(['transaction', 'customer', 'staff', 'location', 'processedBy', 'items']));
    }

    public function reject(Request $request, ReturnModel $return): ReturnResource
    {
        $this->authorize('update', $return);

        $return->update([
            'status' => 'rejected',
            'processed_by' => auth()->id(),
            'processed_at' => now(),
            'notes' => ($return->notes ? $return->notes."\n\n" : '').'REJECTED: '.$request->input('reason', ''),
        ]);

        return new ReturnResource($return->load(['transaction', 'customer', 'staff', 'location', 'processedBy', 'items']));
    }
}
