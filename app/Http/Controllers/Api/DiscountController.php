<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Discount\StoreDiscountRequest;
use App\Http\Requests\Discount\UpdateDiscountRequest;
use App\Http\Resources\DiscountResource;
use App\Models\Discount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscountController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Discount::class);

        $discounts = Discount::query()
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->when($request->input('search'), fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->withCount('transactions')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return DiscountResource::collection($discounts);
    }

    public function store(StoreDiscountRequest $request): DiscountResource
    {
        $this->authorize('create', Discount::class);

        $discount = Discount::create($request->validated());

        return new DiscountResource($discount->loadCount('transactions'));
    }

    public function show(Discount $discount): DiscountResource
    {
        $this->authorize('view', $discount);

        $discount->loadCount('transactions');

        return new DiscountResource($discount);
    }

    public function update(UpdateDiscountRequest $request, Discount $discount): DiscountResource
    {
        $this->authorize('update', $discount);

        $discount->update($request->validated());

        return new DiscountResource($discount->loadCount('transactions'));
    }

    public function destroy(Discount $discount): JsonResponse
    {
        $this->authorize('delete', $discount);

        $discount->delete();

        return $this->respondDeleted('Discount');
    }

    public function toggleActive(Discount $discount): DiscountResource
    {
        $this->authorize('update', $discount);

        $discount->update(['is_active' => ! $discount->is_active]);

        return new DiscountResource($discount->loadCount('transactions'));
    }

    public function usageReport(Request $request, Discount $discount): JsonResponse
    {
        $this->authorize('view', $discount);

        $transactions = $discount->transactions()
            ->dateRange($request->input('from'), $request->input('to'))
            ->selectRaw('COUNT(*) as total_uses, SUM(discount_amount) as total_discount_value, SUM(total) as total_revenue')
            ->first();

        return response()->json([
            'data' => [
                'discount' => new DiscountResource($discount),
                'total_uses' => (int) $transactions->total_uses,
                'total_discount_value' => (float) $transactions->total_discount_value,
                'total_revenue' => (float) $transactions->total_revenue,
            ],
        ]);
    }
}
