<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\ReturnedItem\StoreReturnedItemRequest;
use App\Http\Resources\ReturnedItemResource;
use App\Models\ReturnedItem;
use App\Models\ReturnModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class ReturnedItemController extends ApiController
{
    public function index(ReturnModel $return): JsonResource
    {
        $this->authorize('view', $return);

        $items = $return->items()
            ->with(['product', 'variant'])
            ->get();

        return ReturnedItemResource::collection($items);
    }

    public function store(StoreReturnedItemRequest $request, ReturnModel $return): ReturnedItemResource
    {
        $this->authorize('update', $return);

        $item = $return->items()->create($request->validated());

        return new ReturnedItemResource($item->load(['product', 'variant']));
    }

    public function show(ReturnedItem $returnedItem): ReturnedItemResource
    {
        $this->authorize('view', $returnedItem->return);

        $returnedItem->load(['product', 'variant']);

        return new ReturnedItemResource($returnedItem);
    }

    public function destroy(ReturnedItem $returnedItem): JsonResponse
    {
        $this->authorize('update', $returnedItem->return);

        $returnedItem->delete();

        return $this->respondDeleted('Returned item');
    }
}
