import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { FormPage } from '@/components/admin/form-page';
import { SkuGenerator } from '@/components/admin/sku-generator';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    AdminProduct,
    AttributeOption,
    ColorOption,
    ComponentOption,
    SelectOption,
} from '@/types/admin-product';
import { AddOnsPanel } from './components/AddOnsPanel';
import { ColorsPanel } from './components/ColorsPanel';
import { ImagesPanel } from './components/ImagesPanel';
import { KitMappingsPanel } from './components/KitMappingsPanel';
import { SetupInstructionsPanel } from './components/SetupInstructionsPanel';
import { StockPanel } from './components/StockPanel';
import { VariantsPanel } from './components/VariantsPanel';

type Props = {
    product: AdminProduct | null;
    categories: SelectOption[];
    taxCategories: SelectOption[];
    colors: ColorOption[];
    locations: SelectOption[];
    components?: ComponentOption[];
    addOnProducts?: SelectOption[];
    attributes?: AttributeOption[];
    prefill?: Record<string, unknown> | null;
};

/**
 * Product create/edit form page.
 * Uses Inertia useForm for validation and submission.
 */
export default function ProductForm({
    product,
    categories,
    taxCategories,
    colors,
    locations = [],
    components = [],
    addOnProducts = [],
    attributes = [],
    prefill = null,
}: Props) {
    const isEditing = product !== null;
    const allowNextLeaveRef = useRef(false);
    const page = usePage();
    const sharedPrefill =
        (page.props.prefill as Record<string, unknown> | null | undefined) ??
        prefill ??
        null;
    const hasPrefill = Boolean(sharedPrefill);

    const initialData = {
        name:
            !isEditing && sharedPrefill?.name
                ? String(sharedPrefill.name)
                : (product?.name ?? ''),
        sku:
            !isEditing && sharedPrefill?.sku
                ? String(sharedPrefill.sku)
                : (product?.sku ?? ''),
        barcode:
            !isEditing && sharedPrefill?.barcode
                ? String(sharedPrefill.barcode)
                : (product?.barcode ?? ''),
        description:
            !isEditing && sharedPrefill?.description
                ? String(sharedPrefill.description)
                : (product?.description ?? ''),
        cost_price:
            !isEditing && sharedPrefill?.cost_price
                ? String(sharedPrefill.cost_price)
                : (product?.cost_price ?? '0'),
        selling_price:
            !isEditing && sharedPrefill?.selling_price
                ? String(sharedPrefill.selling_price)
                : (product?.selling_price ?? '0'),
        product_type:
            !isEditing && sharedPrefill?.product_type
                ? String(sharedPrefill.product_type)
                : (product?.product_type ?? 'standard'),
        category_id:
            !isEditing && sharedPrefill?.category_id
                ? String(sharedPrefill.category_id)
                : (product?.category?.id ?? ''),
        tax_category_id:
            !isEditing && sharedPrefill?.tax_category_id
                ? String(sharedPrefill.tax_category_id)
                : (product?.taxCategory?.id ?? ''),
        is_active:
            !isEditing && sharedPrefill?.is_active !== undefined
                ? Boolean(sharedPrefill.is_active)
                : (product?.is_active ?? true),
        is_kit:
            !isEditing && sharedPrefill?.is_kit !== undefined
                ? Boolean(sharedPrefill.is_kit)
                : (product?.is_kit ?? false),
        is_online_visible:
            !isEditing && sharedPrefill?.is_online_visible !== undefined
                ? Boolean(sharedPrefill.is_online_visible)
                : (product?.is_online_visible ?? true),
        best_seller_enabled:
            !isEditing && sharedPrefill?.best_seller_enabled !== undefined
                ? Boolean(sharedPrefill.best_seller_enabled)
                : (product?.best_seller_enabled ?? false),
        best_seller_rank: product?.best_seller_rank ?? null,
        track_inventory:
            !isEditing && sharedPrefill?.track_inventory !== undefined
                ? Boolean(sharedPrefill.track_inventory)
                : (product?.track_inventory ?? true),
        reorder_level:
            !isEditing && sharedPrefill?.reorder_level
                ? String(sharedPrefill.reorder_level)
                : (product?.reorder_level ?? ''),
        unit:
            !isEditing && sharedPrefill?.unit
                ? String(sharedPrefill.unit)
                : (product?.unit ?? 'each'),
        customise_color:
            !isEditing && sharedPrefill?.customise_color !== undefined
                ? Boolean(sharedPrefill.customise_color)
                : (product?.customise_color ?? false),
        customise_text:
            !isEditing && sharedPrefill?.customise_text !== undefined
                ? Boolean(sharedPrefill.customise_text)
                : (product?.customise_text ?? false),
        preorder:
            !isEditing && sharedPrefill?.preorder !== undefined
                ? Boolean(sharedPrefill.preorder)
                : (product?.preorder ?? false),
        slug:
            !isEditing && sharedPrefill?.slug
                ? String(sharedPrefill.slug)
                : (product?.slug ?? ''),
        // Create-mode stock
        initial_stock_quantity: '',
        initial_stock_location_id: '',
    };

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        isDirty,
        setDefaults,
    } = useForm(initialData);

    // Prefill is handled by initialData above — no need for a useEffect
    // that would overwrite user edits.

    const showColorsPanel =
        isEditing && (product?.customise_color || data.customise_color);
    const needsColorSave =
        isEditing && data.customise_color && !product?.customise_color;
    const showCustomizationDetails =
        data.customise_color || data.customise_text;
    const showKitConfiguration = isEditing && data.product_type === 'kit';

    useEffect(() => {
        if (!isDirty) {
            allowNextLeaveRef.current = false;

            return;
        }

        const handleBefore = (e: Event) => {
            if (allowNextLeaveRef.current) {
                allowNextLeaveRef.current = false;

                return;
            }

            if (
                !window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?',
                )
            ) {
                e.preventDefault();
            }
        };

        const removeListener = router.on('before', handleBefore);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            removeListener();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    const generatedSlug = useMemo(() => {
        return data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }, [data.name]);

    // Submit to create or update endpoint
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Allow the Inertia redirect to proceed without triggering the
        // unsaved-changes confirmation dialog (which is meant for external
        // navigation, not form submission).
        allowNextLeaveRef.current = true;

        const handleSuccess = () => {
            allowNextLeaveRef.current = false;
            setDefaults();
            toast.success(isEditing ? 'Product updated.' : 'Product created.');
        };

        const handleError = () => {
            allowNextLeaveRef.current = false;
        };

        if (isEditing) {
            put(`/admin/products/${product.id}`, {
                onSuccess: handleSuccess,
                onError: handleError,
            });
        } else {
            post('/admin/products', {
                onSuccess: handleSuccess,
                onError: handleError,
            });
        }
    };

    return (
        <>
            <Head
                title={isEditing ? `Edit ${product.name}` : 'Create Product'}
            />
            <FormPage
                title={isEditing ? `Edit ${product.name}` : 'Create Product'}
                backUrl="/admin/products"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isDirty && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            You have unsaved changes. Save the product before
                            leaving this page.
                        </div>
                    )}
                    {!isEditing && hasPrefill && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                            This is a copy of another product. Review the
                            details and save to create it.
                        </div>
                    )}

                    {/* Name and SKU row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);

                                    if (!isEditing && !data.slug) {
                                        // Optional: auto-update slug field if not set yet?
                                        // The requirement just says "show preview", so we will just show it.
                                    }
                                }}
                                placeholder="Product name"
                            />
                            <InputError message={errors.name} />
                            {data.name && (
                                <p className="text-xs text-muted-foreground">
                                    Slug preview:{' '}
                                    <span className="font-mono text-primary">
                                        {data.slug || generatedSlug}
                                    </span>
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <SkuGenerator
                                value={data.sku}
                                onChange={(value) => setData('sku', value)}
                                error={errors.sku}
                            />
                            <InputError message={errors.sku} />
                        </div>
                    </div>

                    {/* Barcode and Unit */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input
                                id="barcode"
                                value={data.barcode}
                                onChange={(e) =>
                                    setData('barcode', e.target.value)
                                }
                                placeholder="Optional barcode"
                            />
                            <InputError message={errors.barcode} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                value={data.unit}
                                onChange={(e) =>
                                    setData('unit', e.target.value)
                                }
                                placeholder="each, kg, litre"
                            />
                            <InputError message={errors.unit} />
                        </div>
                    </div>

                    {/* Price fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cost_price">Cost Price</Label>
                            <Input
                                id="cost_price"
                                type="number"
                                step="0.01"
                                value={data.cost_price}
                                onChange={(e) =>
                                    setData('cost_price', e.target.value)
                                }
                            />
                            <InputError message={errors.cost_price} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="selling_price">Selling Price</Label>
                            <Input
                                id="selling_price"
                                type="number"
                                step="0.01"
                                value={data.selling_price}
                                onChange={(e) =>
                                    setData('selling_price', e.target.value)
                                }
                            />
                            <InputError message={errors.selling_price} />
                        </div>
                    </div>

                    {/* Category and Tax Category dropdowns */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(v) => setData('category_id', v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tax Category</Label>
                            <Select
                                value={data.tax_category_id}
                                onValueChange={(v) =>
                                    setData('tax_category_id', v)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select tax category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {taxCategories.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.tax_category_id} />
                        </div>
                    </div>

                    {/* Product type */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <div className="space-y-2">
                            <Label>Product Type</Label>
                            <Select
                                value={data.product_type}
                                onValueChange={(v) => {
                                    setData('product_type', v);
                                    setData('is_kit', v === 'kit');
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">
                                        Standard
                                    </SelectItem>
                                    <SelectItem value="kit">Kit</SelectItem>
                                    <SelectItem value="service">
                                        Service
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.product_type === 'kit'
                                ? 'Kit configuration becomes available below after the product is saved.'
                                : 'Use Standard for regular products or Service for non-stock items.'}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Optional product description"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_active}
                                onCheckedChange={(v) =>
                                    setData('is_active', !!v)
                                }
                            />
                            <span className="text-sm">Active</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_kit}
                                onCheckedChange={(v) => setData('is_kit', !!v)}
                            />
                            <span className="text-sm">Is Kit</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_online_visible}
                                onCheckedChange={(v) =>
                                    setData('is_online_visible', !!v)
                                }
                            />
                            <span className="text-sm">Display Online</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.track_inventory}
                                onCheckedChange={(v) =>
                                    setData('track_inventory', !!v)
                                }
                            />
                            <span className="text-sm">Track Inventory</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.preorder}
                                onCheckedChange={(v) =>
                                    setData('preorder', !!v)
                                }
                            />
                            <span className="text-sm">Preorder Available</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.best_seller_enabled}
                                onCheckedChange={(v) =>
                                    setData('best_seller_enabled', !!v)
                                }
                            />
                            <span className="text-sm">Pin In Best Sellers</span>
                        </label>
                    </div>

                    {/* Create-mode initial stock */}
                    {data.track_inventory && !isEditing && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="text-sm font-medium">
                                Initial Stock
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Set the starting stock level for this product.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="initial_stock_quantity">
                                        Initial Quantity
                                    </Label>
                                    <Input
                                        id="initial_stock_quantity"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.initial_stock_quantity}
                                        onChange={(e) =>
                                            setData(
                                                'initial_stock_quantity',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    <InputError
                                        message={errors.initial_stock_quantity}
                                    />
                                </div>
                                {Number(data.initial_stock_quantity) > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="initial_stock_location_id">
                                            Location
                                        </Label>
                                        <Select
                                            value={
                                                data.initial_stock_location_id
                                            }
                                            onValueChange={(v) =>
                                                setData(
                                                    'initial_stock_location_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locations.map((loc) => (
                                                    <SelectItem
                                                        key={loc.id}
                                                        value={loc.id}
                                                    >
                                                        {loc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                errors.initial_stock_location_id
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {data.best_seller_enabled && (
                        <div className="space-y-2">
                            <Label htmlFor="best_seller_rank">
                                Best Seller Rank
                            </Label>
                            <Input
                                id="best_seller_rank"
                                type="number"
                                min="1"
                                value={data.best_seller_rank ?? ''}
                                onChange={(e) =>
                                    setData(
                                        'best_seller_rank',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                placeholder="1"
                            />
                            <InputError message={errors.best_seller_rank} />
                            <p className="text-xs text-muted-foreground">
                                Lower ranks appear first before automatic
                                sales-based best sellers.
                            </p>
                        </div>
                    )}

                    {/* Customization toggles */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <h3 className="text-sm font-medium">
                            Enable Customization
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Turn on the customer-facing options this product
                            should support.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.customise_color}
                                    onCheckedChange={(v) =>
                                        setData('customise_color', !!v)
                                    }
                                />
                                <span className="text-sm">
                                    Allow Color Customization
                                </span>
                            </label>
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.customise_text}
                                    onCheckedChange={(v) =>
                                        setData('customise_text', !!v)
                                    }
                                />
                                <span className="text-sm">
                                    Allow Text Customization
                                </span>
                            </label>
                        </div>
                    </div>

                    {showCustomizationDetails && (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition-all">
                            {data.customise_color && data.customise_text
                                ? 'Color and text customization are enabled. Save the product to configure colors and setup instructions below.'
                                : data.customise_color
                                  ? 'Color customization is enabled. Save the product to manage available colors below.'
                                  : 'Text customization is enabled. Save the product to manage setup instructions below.'}
                        </div>
                    )}

                    {isEditing && <ImagesPanel product={product} />}

                    {/* Submit */}
                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {isEditing
                                ? 'Update Product Details'
                                : 'Create Product'}
                        </Button>
                        {data.name && (
                            <p className="text-xs text-muted-foreground">
                                Current slug:{' '}
                                <span className="font-mono text-primary">
                                    {data.slug || generatedSlug}
                                </span>
                            </p>
                        )}
                    </div>
                </form>

                {isEditing && (
                    <div className="mt-8 space-y-6 border-t pt-6">
                        <h2 className="text-lg font-semibold">
                            Additional Configuration
                        </h2>

                        {showKitConfiguration && (
                            <KitMappingsPanel
                                product={product}
                                components={components}
                            />
                        )}

                        <AddOnsPanel
                            product={product}
                            addOnProducts={addOnProducts}
                        />
                        <VariantsPanel
                            product={product}
                            attributes={attributes}
                        />

                        {showColorsPanel && (
                            <div className="space-y-3">
                                {needsColorSave && (
                                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                        Save the product details first to fully
                                        enable color configuration for this
                                        product.
                                    </div>
                                )}
                                <ColorsPanel
                                    product={product}
                                    colors={colors}
                                />
                            </div>
                        )}

                        <SetupInstructionsPanel product={product} />

                        {data.track_inventory && (
                            <StockPanel
                                product={product}
                                locations={locations}
                            />
                        )}
                    </div>
                )}
            </FormPage>
        </>
    );
}
