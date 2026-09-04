<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttributeValue\StoreAttributeValueRequest;
use App\Http\Requests\AttributeValue\UpdateAttributeValueRequest;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admin controller for CRUD on attribute values nested under an Attribute.
 *
 * Attribute values are the concrete choices (e.g. "Red", "Large") for a
 * given attribute definition. They are surfaced inline on the attribute
 * edit page rather than as a separate resource.
 */
class AdminAttributeValueController extends Controller
{
    // Create a new value under the given attribute.
    public function store(StoreAttributeValueRequest $request, Attribute $attribute): RedirectResponse
    {
        $attribute->values()->create($request->validated());

        return redirect()->back()->with('success', 'Attribute value created successfully.');
    }

    // Update a value, ensuring it belongs to the parent attribute in the URL.
    public function update(UpdateAttributeValueRequest $request, Attribute $attribute, AttributeValue $attributeValue): RedirectResponse
    {
        abort_if($attributeValue->attribute_id !== $attribute->id, Response::HTTP_NOT_FOUND);

        $attributeValue->update($request->validated());

        return redirect()->back()->with('success', 'Attribute value updated successfully.');
    }

    // Detach from any variants then soft-delete. Pivot rows are hard-deleted
    // by detach() (VariantAttribute pivot has no SoftDeletes).
    public function destroy(Attribute $attribute, AttributeValue $attributeValue): RedirectResponse
    {
        abort_if($attributeValue->attribute_id !== $attribute->id, Response::HTTP_NOT_FOUND);

        $attributeValue->variants()->detach();
        $attributeValue->delete();

        return redirect()->back()->with('success', 'Attribute value deleted successfully.');
    }
}
