<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class AdminVariantController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku' => ['required', 'string', 'max:255', Rule::unique('variants', 'sku')],
            'barcode' => ['nullable', 'string', 'max:255', Rule::unique('variants', 'barcode')],
            'name' => ['nullable', 'string', 'max:255'],
            'price_adjustment' => ['numeric'],
            'cost_price_adjustment' => ['numeric'],
            'is_active' => ['boolean'],
            'attributes' => ['array'],
            'attributes.*' => ['exists:attribute_values,id'],
        ]);

        $variant = $product->variants()->create([
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'] ?? null,
            'name' => $validated['name'] ?? null,
            'price_adjustment' => $validated['price_adjustment'] ?? 0,
            'cost_price_adjustment' => $validated['cost_price_adjustment'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['attributes'])) {
            $variant->attributeValues()->sync($validated['attributes']);
        }

        return redirect()->back()->with('success', 'Variant created successfully.');
    }

    public function update(Request $request, Product $product, Variant $variant)
    {
        abort_if($variant->product_id !== $product->id, Response::HTTP_NOT_FOUND);

        $validated = $request->validate([
            'sku' => ['required', 'string', 'max:255', Rule::unique('variants', 'sku')->ignore($variant->id)],
            'barcode' => ['nullable', 'string', 'max:255', Rule::unique('variants', 'barcode')->ignore($variant->id)],
            'name' => ['nullable', 'string', 'max:255'],
            'price_adjustment' => ['numeric'],
            'cost_price_adjustment' => ['numeric'],
            'is_active' => ['boolean'],
            'attributes' => ['array'],
            'attributes.*' => ['exists:attribute_values,id'],
        ]);

        $variant->update([
            'sku' => $validated['sku'],
            'barcode' => $validated['barcode'] ?? null,
            'name' => $validated['name'] ?? null,
            'price_adjustment' => $validated['price_adjustment'] ?? 0,
            'cost_price_adjustment' => $validated['cost_price_adjustment'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['attributes'])) {
            $variant->attributeValues()->sync($validated['attributes']);
        }

        return redirect()->back()->with('success', 'Variant updated successfully.');
    }

    public function destroy(Product $product, Variant $variant)
    {
        abort_if($variant->product_id !== $product->id, Response::HTTP_NOT_FOUND);

        $variant->delete();

        return redirect()->back()->with('success', 'Variant deleted successfully.');
    }
}
