<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\Country\StoreCountryRequest;
use App\Http\Requests\Country\UpdateCountryRequest;
use App\Http\Resources\CountryResource;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryController extends ApiController
{
    public function index(Request $request): JsonResource
    {
        $this->authorize('viewAny', Country::class);

        $countries = Country::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"))
            ->when($request->boolean('is_active') !== null, fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return CountryResource::collection($countries);
    }

    public function store(StoreCountryRequest $request): CountryResource
    {
        $this->authorize('create', Country::class);

        $country = Country::create($request->validated());

        return new CountryResource($country);
    }

    public function show(Country $country): CountryResource
    {
        $this->authorize('view', $country);

        $country->loadCount(['suppliers', 'customerAddresses']);

        return new CountryResource($country);
    }

    public function update(UpdateCountryRequest $request, Country $country): CountryResource
    {
        $this->authorize('update', $country);

        $country->update($request->validated());

        return new CountryResource($country->refresh());
    }

    public function destroy(Country $country): JsonResponse
    {
        $this->authorize('delete', $country);

        $country->delete();

        return $this->respondDeleted('Country');
    }

    public function active(): AnonymousResourceCollection
    {
        $countries = Country::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CountryResource::collection($countries);
    }
}
