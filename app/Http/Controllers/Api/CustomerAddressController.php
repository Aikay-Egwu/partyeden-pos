<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\CustomerAddress\StoreCustomerAddressRequest;
use App\Http\Requests\CustomerAddress\UpdateCustomerAddressRequest;
use App\Http\Resources\CustomerAddressResource;
use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerAddressController extends ApiController
{
    public function index(Request $request, Customer $customer): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CustomerAddress::class);

        $addresses = $customer->addresses()
            ->with('country')
            ->orderBy('is_default', 'desc')
            ->get();

        return CustomerAddressResource::collection($addresses);
    }

    public function store(StoreCustomerAddressRequest $request, Customer $customer): CustomerAddressResource
    {
        $this->authorize('create', CustomerAddress::class);

        $data = $request->validated();

        // If setting as default, unset other defaults of same type
        if ($request->boolean('is_default')) {
            $customer->addresses()
                ->where('type', $data['type'] ?? 'shipping')
                ->update(['is_default' => false]);
        }

        $address = $customer->addresses()->create($data);
        $address->load('country');

        return new CustomerAddressResource($address);
    }

    public function show(CustomerAddress $customerAddress): CustomerAddressResource
    {
        $this->authorize('view', $customerAddress);

        $customerAddress->load('country');

        return new CustomerAddressResource($customerAddress);
    }

    public function update(UpdateCustomerAddressRequest $request, CustomerAddress $customerAddress): CustomerAddressResource
    {
        $this->authorize('update', $customerAddress);

        $customerAddress->update($request->validated());

        return new CustomerAddressResource($customerAddress->refresh()->load('country'));
    }

    public function destroy(CustomerAddress $customerAddress): JsonResponse
    {
        $this->authorize('delete', $customerAddress);

        $customerAddress->delete();

        return $this->respondDeleted('Customer address');
    }

    public function setDefault(Customer $customer, CustomerAddress $customerAddress): JsonResponse
    {
        $this->authorize('update', $customerAddress);

        $customer->addresses()
            ->where('type', $customerAddress->type)
            ->update(['is_default' => false]);

        $customerAddress->update(['is_default' => true]);

        return response()->json(['message' => 'Default address updated.']);
    }
}
