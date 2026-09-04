<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Occasion\StoreOccasionRequest;
use App\Http\Requests\Occasion\UpdateOccasionRequest;
use App\Models\Occasion;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminOccasionController extends Controller
{
    public function index(Request $request): Response
    {
        $occasions = Occasion::query()
            ->when($request->search, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/occasions/index', [
            'occasions' => $occasions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/occasions/form', [
            'occasion' => null,
            'products' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name', 'sku']),
        ]);
    }

    public function store(StoreOccasionRequest $request)
    {
        $occasion = Occasion::create($request->safe()->except(['image', 'product_ids']));

        if ($request->hasFile('image')) {
            $occasion->update([
                'image_path' => $request->file('image')->store('occasions', 'public'),
            ]);
        }

        $occasion->products()->sync($this->syncPayload($request->input('product_ids', [])));

        return redirect()->route('occasions.index')
            ->with('success', 'Occasion created successfully.');
    }

    public function edit(Occasion $occasion): Response
    {
        $occasion->load('products:id,name,sku');

        return Inertia::render('admin/occasions/form', [
            'occasion' => [
                ...$occasion->toArray(),
                'products' => $occasion->products->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                ])->values(),
            ],
            'products' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name', 'sku']),
        ]);
    }

    public function update(UpdateOccasionRequest $request, Occasion $occasion)
    {
        $occasion->update($request->safe()->except(['image', 'product_ids']));

        if ($request->hasFile('image')) {
            if ($occasion->image_path) {
                Storage::disk('public')->delete($occasion->image_path);
            }

            $occasion->update([
                'image_path' => $request->file('image')->store('occasions', 'public'),
            ]);
        } elseif ($request->input('image_path') === '') {
            if ($occasion->image_path) {
                Storage::disk('public')->delete($occasion->image_path);
            }

            $occasion->update(['image_path' => null]);
        }

        $occasion->products()->sync($this->syncPayload($request->input('product_ids', [])));

        return redirect()->route('occasions.index')
            ->with('success', 'Occasion updated successfully.');
    }

    public function destroy(Occasion $occasion)
    {
        if ($occasion->image_path) {
            Storage::disk('public')->delete($occasion->image_path);
        }

        $occasion->delete();

        return redirect()->route('occasions.index')
            ->with('success', 'Occasion deleted successfully.');
    }

    private function syncPayload(array $productIds): array
    {
        $payload = [];

        foreach (array_values($productIds) as $index => $productId) {
            $payload[$productId] = [
                'id' => (string) Str::uuid(),
                'sort_order' => $index,
            ];
        }

        return $payload;
    }
}
