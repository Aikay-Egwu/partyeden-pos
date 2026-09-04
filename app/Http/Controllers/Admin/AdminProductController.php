<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Attribute;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Color;
use App\Models\InventoryBalance;
use App\Models\InventoryMovement;
use App\Models\Location;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\TaxCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin page controller for Products CRUD.
 * Renders Inertia pages with server-side data props.
 */
class AdminProductController extends Controller
{
    // Paginated list with search and filters
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%")
                    ->orWhere('barcode', 'like', "%{$s}%");
            }))
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->with(['category', 'taxCategory'])
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'category_id', 'is_active']),
        ]);
    }

    // Create form with dropdown data
    public function create(): Response
    {
        // dd("nothing");

        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'taxCategories' => TaxCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'colors' => Color::where('is_active', true)->orderBy('name')->get(),
            'locations' => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // Store new product using existing validation
    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->safe()->except([
            'initial_stock_quantity', 'initial_stock_location_id',
        ]));

        AuditLog::create([
            'event' => 'created',
            'auditable_type' => Product::class,
            'auditable_id' => $product->id,
            'user_id' => $request->user()?->id,
            'new_values' => $product->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'description' => 'Product created: '.$product->name,
        ]);

        // Create initial stock entry if requested
        if ($product->track_inventory && (float) $request->initial_stock_quantity > 0) {
            $locationId = $request->initial_stock_location_id
                ?? Location::where('is_active', true)->value('id');

            if ($locationId) {
                InventoryBalance::create([
                    'product_id' => $product->id,
                    'location_id' => $locationId,
                    'quantity' => $request->initial_stock_quantity,
                ]);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'location_id' => $locationId,
                    'type' => 'in',
                    'quantity' => $request->initial_stock_quantity,
                    'reason' => 'Initial stock',
                    'user_id' => $request->user()?->id,
                ]);
            }
        }

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Duplicate a product: copy core fields, generate a new SKU,
     * and redirect to the create form pre-populated with those values.
     */
    public function duplicate(Product $product)
    {
        $newSku = Product::generateNextSku();

        return redirect()->route('products.create')
            ->with('prefill', [
                'name' => 'Copy of '.$product->name,
                'sku' => $newSku,
                'description' => $product->description,
                'category_id' => $product->category_id,
                'tax_category_id' => $product->tax_category_id,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'product_type' => $product->product_type,
                'customise_color' => $product->customise_color,
                'customise_text' => $product->customise_text,
                'preorder' => $product->preorder,
                'is_active' => $product->is_active,
                'is_kit' => $product->is_kit,
                'track_inventory' => $product->track_inventory,
                'reorder_level' => $product->reorder_level,
                'unit' => $product->unit,
                'is_online_visible' => $product->is_online_visible,
                'best_seller_enabled' => $product->best_seller_enabled,
            ]);
    }

    public function edit(Product $product): Response
    {
        $product->load([
            'category',
            'taxCategory',
            'mainColors.color',
            'secondaryColors.color',
            'kitMappings.component',
            'kitMappings.variant',
            'addOns',
            'setupInstruction',
            'images.variant',
            'images.primaryColor',
            'images.addonProduct',
            'variants.attributeValues.attribute',
            'inventoryBalances.location',
        ]);

        return Inertia::render('admin/products/form', [
            'product' => $this->mapProductForEdit($product),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'taxCategories' => TaxCategory::orderBy('name')->get(['id', 'name']),
            'colors' => Color::where('is_active', true)->orderBy('name')->get(),
            'components' => Product::where('is_kit', false)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
            'addOnProducts' => Product::where('id', '!=', $product->id)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku']),
            'attributes' => Attribute::with('values')->orderBy('name')->get(),
            'locations' => Location::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // Update using existing validation
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function updateKitMappings(Request $request, Product $product)
    {
        $validated = $request->validate([
            'mappings' => ['array'],
            'mappings.*.product_id' => ['required', 'uuid', 'exists:products,id'],
            'mappings.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'mappings.*.variant_id' => ['nullable', 'uuid', 'exists:variants,id'],
        ]);

        $product->kitMappings()->delete();
        foreach ($validated['mappings'] ?? [] as $mapping) {
            $product->kitMappings()->create($mapping);
        }

        return redirect()->back()->with('success', 'Kit components updated.');
    }

    public function updateAddOns(Request $request, Product $product)
    {
        $validated = $request->validate([
            'add_ons' => ['array'],
            'add_ons.*.add_on_product_id' => ['required', 'uuid', 'exists:products,id'],
            'add_ons.*.is_active' => ['boolean'],
            'add_ons.*.sort_order' => ['integer'],
        ]);

        $syncData = [];
        foreach ($validated['add_ons'] ?? [] as $addon) {
            $syncData[$addon['add_on_product_id']] = [
                'id' => (string) Str::uuid(),
                'is_active' => $addon['is_active'] ?? true,
                'sort_order' => $addon['sort_order'] ?? 0,
            ];
        }

        $product->addOns()->sync($syncData);

        return redirect()->back()->with('success', 'Add-ons updated.');
    }

    public function updateColors(Request $request, Product $product)
    {
        $validated = $request->validate([
            'main_colors' => ['array'],
            'main_colors.*' => ['exists:colors,id'],
            'secondary_colors' => ['array', 'max:2'],
            'secondary_colors.*' => ['exists:colors,id'],
        ]);

        $mainColorIds = $this->normalizedColorIds($validated['main_colors'] ?? []);
        $secondaryColorIds = $this->normalizedColorIds($validated['secondary_colors'] ?? []);

        // Validate that customisable products have at least one main color
        if ($product->customise_color && $mainColorIds === []) {
            return redirect()->back()->withErrors([
                'main_colors' => 'Products with color customization enabled require at least one main color.',
            ]);
        }

        // Validate that main and secondary colors do not overlap
        $overlap = array_intersect($mainColorIds, $secondaryColorIds);
        if ($overlap !== []) {
            return redirect()->back()->withErrors([
                'secondary_colors' => 'Secondary colors must not overlap with main colors.',
            ]);
        }

        DB::transaction(function () use ($product, $mainColorIds, $secondaryColorIds): void {
            $product->mainColors()->delete();
            foreach ($mainColorIds as $colorId) {
                $product->mainColors()->create(['color_id' => $colorId]);
            }

            $product->secondaryColors()->delete();
            foreach ($secondaryColorIds as $colorId) {
                $product->secondaryColors()->create(['color_id' => $colorId]);
            }
        });

        return redirect()->back()->with('success', 'Colors updated.');
    }

    public function storeColor(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:colors,name'],
            'hex_code' => ['nullable', 'regex:/^#?[A-Fa-f0-9]{6}$/'],
            'target' => ['required', 'in:main,secondary'],
        ]);

        $color = Color::create([
            'name' => $validated['name'],
            'hex_code' => $this->normalizeHexCode($validated['hex_code'] ?? null),
            'is_active' => true,
        ]);

        if ($validated['target'] === 'main') {
            $product->mainColors()->firstOrCreate(['color_id' => $color->id]);
        } else {
            $product->secondaryColors()->firstOrCreate(['color_id' => $color->id]);
        }

        return redirect()->back()->with('success', 'Color created and attached to product.');
    }

    public function updateSetupInstruction(Request $request, Product $product)
    {
        $validated = $request->validate([
            'tools' => ['nullable', 'string'],
            'items' => ['nullable', 'string'],
            'instructions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($product->setupInstruction) {
            $product->setupInstruction()->update($validated);
        } else {
            $product->setupInstruction()->create($validated);
        }

        return redirect()->back()->with('success', 'Setup instructions updated.');
    }

    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'stock_entries' => ['nullable', 'array'],
            'stock_entries.*.location_id' => ['required', 'uuid', 'exists:locations,id'],
            'stock_entries.*.quantity' => ['required', 'numeric', 'min:0'],
            'stock_entries.*.reason' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($validated['stock_entries'] ?? [] as $entry) {
            $balance = InventoryBalance::firstOrCreate([
                'product_id' => $product->id,
                'location_id' => $entry['location_id'],
                'variant_id' => null,
            ]);

            $oldQuantity = (float) $balance->quantity;
            $newQuantity = (float) $entry['quantity'];

            if ($newQuantity !== $oldQuantity) {
                $balance->update(['quantity' => $newQuantity]);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'location_id' => $entry['location_id'],
                    'type' => 'adjustment',
                    'quantity' => $newQuantity - $oldQuantity,
                    'reason' => $entry['reason'] ?? 'Manual adjustment via product edit',
                    'user_id' => $request->user()?->id,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Stock levels updated.');
    }

    // Soft delete
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }

    private function normalizedColorIds(array $colorIds): array
    {
        return array_values(array_unique(array_map(static fn ($id): int => (int) $id, $colorIds)));
    }

    private function normalizeHexCode(?string $hexCode): ?string
    {
        if ($hexCode === null || trim($hexCode) === '') {
            return null;
        }

        $normalizedHex = strtoupper(trim($hexCode));

        return str_starts_with($normalizedHex, '#') ? $normalizedHex : "#{$normalizedHex}";
    }

    private function mapProductForEdit(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'description' => $product->description,
            'cost_price' => $product->cost_price,
            'selling_price' => $product->selling_price,
            'product_type' => $product->product_type,
            'is_active' => $product->is_active,
            'is_kit' => $product->is_kit,
            'track_inventory' => $product->track_inventory,
            'reorder_level' => $product->reorder_level,
            'unit' => $product->unit,
            'customise_color' => $product->customise_color,
            'customise_text' => $product->customise_text,
            'preorder' => $product->preorder,
            'is_online_visible' => $product->is_online_visible,
            'best_seller_enabled' => $product->best_seller_enabled,
            'best_seller_rank' => $product->best_seller_rank,
            'category' => $product->category?->only(['id', 'name']),
            'taxCategory' => $product->taxCategory?->only(['id', 'name']),
            'main_colors' => $product->mainColors
                ->sortBy(fn ($link) => $link->color?->name)
                ->values()
                ->map(fn ($link) => [
                    'id' => $link->id,
                    'color_id' => $link->color_id,
                    'color' => $link->color?->only(['id', 'name', 'hex_code', 'is_active']),
                ])->all(),
            'secondary_colors' => $product->secondaryColors
                ->sortBy(fn ($link) => $link->color?->name)
                ->values()
                ->map(fn ($link) => [
                    'id' => $link->id,
                    'color_id' => $link->color_id,
                    'color' => $link->color?->only(['id', 'name', 'hex_code', 'is_active']),
                ])->all(),
            'kit_mappings' => $product->kitMappings
                ->map(fn ($mapping) => [
                    'id' => $mapping->id,
                    'product_id' => $mapping->product_id,
                    'variant_id' => $mapping->variant_id,
                    'quantity' => $mapping->quantity,
                    'component' => $mapping->component?->only(['id', 'name', 'sku']),
                    'variant' => $mapping->variant?->only(['id', 'name', 'sku']),
                ])->all(),
            'add_ons' => $product->addOns
                ->sortBy(fn ($addOn) => $addOn->pivot->sort_order)
                ->values()
                ->map(fn ($addOn) => [
                    'id' => $addOn->id,
                    'name' => $addOn->name,
                    'pivot' => [
                        'add_on_product_id' => $addOn->pivot->add_on_product_id,
                        'is_active' => (bool) $addOn->pivot->is_active,
                        'sort_order' => $addOn->pivot->sort_order,
                    ],
                ])->all(),
            'setup_instruction' => $product->setupInstruction?->only(['id', 'tools', 'items', 'instructions', 'notes']),
            'inventory_balances' => $product->inventoryBalances
                ->map(fn ($balance) => [
                    'id' => $balance->id,
                    'location_id' => $balance->location_id,
                    'quantity' => (float) $balance->quantity,
                    'reserved_quantity' => (float) $balance->reserved_quantity,
                    'location' => $balance->location?->only(['id', 'name']),
                ])->values()->all(),
            'images' => $product->images
                ->sortBy([
                    ['is_primary', 'desc'],
                    ['sort_order', 'asc'],
                    ['created_at', 'asc'],
                ])
                ->values()
                ->map(fn (ProductImage $image) => $this->mapProductImage($image))
                ->all(),
            'variants' => $product->variants
                ->sortBy('name')
                ->values()
                ->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'sku' => $variant->sku,
                        'barcode' => $variant->barcode,
                        'name' => $variant->name,
                        'price_adjustment' => $variant->price_adjustment,
                        'cost_price_adjustment' => $variant->cost_price_adjustment,
                        'is_active' => $variant->is_active,
                        'attribute_values' => $variant->attributeValues
                            ->map(fn ($attributeValue) => [
                                'id' => $attributeValue->id,
                                'value' => $attributeValue->value,
                                'attribute' => $attributeValue->attribute?->only(['id', 'name']),
                            ])->all(),
                    ];
                })->all(),
        ];
    }

    private function mapProductImage(ProductImage $image): array
    {
        return [
            'id' => $image->id,
            'file_path' => $image->file_path,
            'file_name' => $image->file_name,
            'alt_text' => $image->alt_text,
            'sort_order' => $image->sort_order,
            'is_primary' => $image->is_primary,
            'url' => $image->url,
            'variant_id' => $image->variant_id,
            'primary_color_id' => $image->primary_color_id,
            'addon_product_id' => $image->addon_product_id,
            'binding_type' => $image->bindingType(),
            'variant' => $image->variant?->only(['id', 'name', 'sku']),
            'primary_color' => $image->primaryColor?->only(['id', 'name', 'hex_code']),
            'addon_product' => $image->addonProduct?->only(['id', 'name', 'sku']),
        ];
    }
}
