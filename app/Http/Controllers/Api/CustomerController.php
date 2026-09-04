<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Customer::class);

        $customers = Customer::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            }))
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->withCount(['addresses', 'orders', 'transactions'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($request->integer('per_page', 15));

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): CustomerResource
    {
        $this->authorize('create', Customer::class);

        $customer = Customer::create($request->validated());

        // Auto-create loyalty account
        $customer->loyaltyAccount()->create([
            'points_balance' => 0,
            'total_points_earned' => 0,
            'total_points_redeemed' => 0,
        ]);

        return new CustomerResource($customer->load('loyaltyAccount'));
    }

    public function show(Customer $customer): CustomerResource
    {
        $this->authorize('view', $customer);

        $customer->load(['addresses.country', 'loyaltyAccount']);
        $customer->loadCount(['addresses', 'orders', 'transactions']);

        return new CustomerResource($customer);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $this->authorize('update', $customer);

        $customer->update($request->validated());

        return new CustomerResource($customer->refresh()->load('loyaltyAccount'));
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return $this->respondDeleted('Customer');
    }

    public function search(Request $request): JsonResource
    {
        $this->authorize('viewAny', Customer::class);

        $customers = Customer::query()
            ->where(function ($q) use ($request) {
                $s = $request->search;
                $q->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            })
            ->where('is_active', true)
            ->limit(20)
            ->get();

        return CustomerResource::collection($customers);
    }
}
