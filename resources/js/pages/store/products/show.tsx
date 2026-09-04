import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    ShoppingCart,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

const FONT_OPTIONS = [
    { value: 'Arial', label: 'Arial', fontFamily: 'Arial, sans-serif' },
    { value: 'Georgia', label: 'Georgia', fontFamily: 'Georgia, serif' },
    {
        value: 'Script',
        label: 'Script',
        fontFamily: '"Brush Script MT", cursive',
    },
    {
        value: 'Cursive',
        label: 'Cursive',
        fontFamily: '"Snell Roundhand", cursive',
    },
];

// Color shape for customization
type Color = {
    id: number;
    name: string;
    hex_code: string | null;
};

type ProductImage = {
    id: string;
    file_name?: string;
    alt_text?: string | null;
    url: string;
    sort_order: number;
    is_primary: boolean;
    binding_type: 'default' | 'variant' | 'primary_color' | 'addon';
    variant_id?: string | null;
    primary_color_id?: number | null;
    addon_product_id?: string | null;
};

// Shape from controller
type Variant = {
    id: string;
    sku: string;
    name: string | null;
    price_adjustment: string;
    is_active: boolean;
    images?: ProductImage[];
    variant_attributes?: Array<{
        attribute_value?: {
            id: string;
            value: string;
            attribute?: { id: string; name: string };
        } | null;
    }> | null;
};

type Product = {
    id: string;
    name: string;
    sku: string;
    description?: string | null;
    selling_price: string;
    product_type: string;
    unit: string;
    customise_color: boolean;
    customise_text: boolean;
    preorder: boolean;
    category?: { id: string; name: string } | null;
    images?: ProductImage[];
    variants?: Variant[];
    main_colors?: Array<{ id: string; color_id: number; color: Color }>;
    secondary_colors?: Array<{ id: string; color_id: number; color: Color }>;
    kit_mappings?: Array<{
        id: string;
        quantity: string;
        component?: { id: string; name: string } | null;
        variant?: { id: string; name: string | null } | null;
    }>;
    add_ons?: Array<{
        id: string;
        name: string;
        selling_price: string;
        images?: ProductImage[];
    }>;
};

type Props = {
    product: Product;
};

/**
 * Compact horizontal carousel for variant selection.
 * Shows small thumbnail + label chips; scrolls with prev/next arrows when variants overflow.
 */
function VariantCarousel({
    variants,
    selectedVariant,
    basePrice,
    onSelect,
}: {
    variants: Variant[];
    selectedVariant: Variant | null;
    basePrice: number;
    onSelect: (v: Variant) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) {
            return;
        }

        // Scroll by ~3 card widths
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -240 : 240,
            behavior: 'smooth',
        });
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                Available Variants
            </label>
            <div className="relative">
                {/* Left arrow */}
                {variants.length > 4 && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        aria-label="Scroll variants left"
                        className="absolute top-1/2 left-0 z-10 flex size-6 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
                    >
                        <ChevronLeft className="size-3.5" />
                    </button>
                )}

                {/* Scrollable strip */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto scroll-smooth px-1 pb-1"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {variants.map((variant) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const variantImage = variant.images?.[0];
                        const label =
                            (variant.variant_attributes ?? [])
                                .map((va) => va.attribute_value?.value)
                                .filter(Boolean)
                                .join(' / ') ||
                            variant.name ||
                            variant.sku;
                        const price = (
                            basePrice + Number(variant.price_adjustment)
                        ).toFixed(2);

                        return (
                            <button
                                key={variant.id}
                                type="button"
                                onClick={() => onSelect(variant)}
                                title={`${label} — ${formatCurrency(price)}`}
                                className={`flex flex-none flex-col items-center gap-1 rounded-lg border p-1.5 text-center transition-colors hover:border-primary ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border'
                                }`}
                                style={{ width: '72px' }}
                            >
                                {/* Small square thumbnail */}
                                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/30">
                                    {variantImage ? (
                                        <img
                                            src={variantImage.url}
                                            alt={variant.name || variant.sku}
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                (
                                                    e.currentTarget as HTMLImageElement
                                                ).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <ShoppingCart className="size-5 text-muted-foreground/40" />
                                    )}
                                </div>
                                {/* Label — truncated to 2 lines */}
                                <span
                                    className={`line-clamp-2 w-full text-center text-[10px] leading-tight ${
                                        isSelected
                                            ? 'font-semibold text-primary'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {label}
                                </span>
                                <span className="text-[10px] font-medium">
                                    {formatCurrency(price)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right arrow */}
                {variants.length > 4 && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        aria-label="Scroll variants right"
                        className="absolute top-1/2 right-0 z-10 flex size-6 translate-x-1 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
                    >
                        <ChevronRight className="size-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Product detail page with images, variant selector, and add-to-cart.
 */
export default function ProductShow({ product }: Props) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        product.variants?.length === 1 ? product.variants[0] : null,
    );
    const [quantity, setQuantity] = useState(1);

    // Customization state
    const [customText, setCustomText] = useState('');
    const [customFont, setCustomFont] = useState('');
    const [primaryColorId, setPrimaryColorId] = useState<number | null>(null);
    const [secondaryColorId, setSecondaryColorId] = useState<number | null>(
        null,
    );
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState('');

    // Determine display price
    const basePrice = Number(product.selling_price);
    const variantAdjustment = selectedVariant
        ? Number(selectedVariant.price_adjustment)
        : 0;
    const displayPrice = (basePrice + variantAdjustment).toFixed(2);
    const requiresPrimaryColor =
        product.customise_color && (product.main_colors?.length ?? 0) > 0;
    const requiresVariant = (product.variants?.length ?? 0) > 0;
    const canAddToCart =
        (!requiresPrimaryColor || primaryColorId !== null) &&
        (!requiresVariant || selectedVariant !== null);
    const missingSelectionMessage =
        requiresVariant && selectedVariant === null
            ? 'Select a variant before adding this item to your cart.'
            : requiresPrimaryColor && primaryColorId === null
              ? 'Select a primary color before adding this item to your cart.'
              : '';

    const selectedAddonPreviewId =
        selectedAddOnIds[selectedAddOnIds.length - 1] ?? null;
    const resolvedImages = useMemo(() => {
        const images = product.images ?? [];

        if (selectedAddonPreviewId) {
            const selectedAddon = (product.add_ons ?? []).find(
                (addOn) => addOn.id === selectedAddonPreviewId,
            );
            const addonImages = selectedAddon?.images ?? [];

            if (addonImages.length > 0) {
                const defaultImages = images.filter(
                    (image) => image.binding_type === 'default',
                );

                return [...addonImages, ...defaultImages];
            }
        }

        if (selectedVariant) {
            const variantImages = images.filter(
                (image) =>
                    image.binding_type === 'variant' &&
                    image.variant_id === selectedVariant.id,
            );

            if (variantImages.length > 0) {
                const defaultImages = images.filter(
                    (image) => image.binding_type === 'default',
                );

                return [...variantImages, ...defaultImages];
            }
        }

        if (primaryColorId !== null) {
            const colorImages = images.filter(
                (image) =>
                    image.binding_type === 'primary_color' &&
                    image.primary_color_id === primaryColorId,
            );

            if (colorImages.length > 0) {
                return colorImages;
            }
        }

        const defaultImages = images.filter(
            (image) => image.binding_type === 'default',
        );

        return defaultImages.length > 0 ? defaultImages : images;
    }, [
        primaryColorId,
        product.add_ons,
        product.images,
        selectedAddonPreviewId,
        selectedVariant,
    ]);

    const activeImage =
        resolvedImages.find((image) => image.id === selectedImageId) ??
        resolvedImages[0];

    const handleAddToCart = () => {
        if (requiresVariant && !selectedVariant) {
            setValidationMessage(
                'Select a variant before adding this item to your cart.',
            );

            return;
        }

        if (requiresPrimaryColor && primaryColorId === null) {
            setValidationMessage(
                'Select a primary color before adding this item to your cart.',
            );

            return;
        }

        setValidationMessage('');

        router.post(
            '/cart/add',
            {
                product_id: product.id,
                variant_id: selectedVariant?.id ?? null,
                quantity,
                // Pass customization choices to the cart
                customization_text: product.customise_text
                    ? customText
                    : undefined,
                customization_font:
                    product.customise_text && customFont
                        ? customFont
                        : undefined,
                customization_primary_color_id: product.customise_color
                    ? primaryColorId
                    : undefined,
                customization_secondary_color_id: product.customise_color
                    ? secondaryColorId
                    : undefined,
                add_on_ids: selectedAddOnIds,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const selectVariant = (variant: Variant) => {
        setSelectedVariant(variant);
        setValidationMessage('');

        // Immediately update the main image to the variant's first image when selected
        const variantImages = (product.images ?? []).filter(
            (img) =>
                img.binding_type === 'variant' && img.variant_id === variant.id,
        );

        if (variantImages.length > 0) {
            setSelectedImageId(variantImages[0].id);
        } else if ((product.images?.length ?? 0) > 0) {
            // Fall back to the first default image
            const defaultImg = (product.images ?? []).find(
                (img) => img.binding_type === 'default',
            );

            if (defaultImg) {
                setSelectedImageId(defaultImg.id);
            }
        }
    };

    const toggleAddOn = (addOnId: string) => {
        setSelectedAddOnIds((current) =>
            current.includes(addOnId) ? [] : [addOnId],
        );
    };

    return (
        <>
            <Head title={product.name} />
            <div className="space-y-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-foreground">
                        Products
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Image */}
                    <div className="space-y-4">
                        <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted/20 p-8">
                            {activeImage ? (
                                <img
                                    src={activeImage.url}
                                    alt={activeImage.alt_text || product.name}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                        (
                                            e.currentTarget as HTMLImageElement
                                        ).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <ShoppingCart className="size-24 text-muted-foreground/30" />
                            )}
                        </div>

                        {resolvedImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                                {resolvedImages.map((image) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageId(image.id)
                                        }
                                        className={`overflow-hidden rounded-md border bg-background p-1 transition-colors ${
                                            activeImage?.id === image.id
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'hover:border-primary'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={
                                                image.alt_text ||
                                                image.file_name ||
                                                product.name
                                            }
                                            className="aspect-square h-full w-full object-cover"
                                            onError={(e) => {
                                                (
                                                    e.currentTarget as HTMLImageElement
                                                ).style.display = 'none';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Variant selectors — compact carousel */}
                        {(product.variants?.length ?? 0) > 0 && (
                            <VariantCarousel
                                variants={product.variants ?? []}
                                selectedVariant={selectedVariant}
                                basePrice={basePrice}
                                onSelect={selectVariant}
                            />
                        )}
                    </div>

                    {/* Product info */}
                    <div className="space-y-6">
                        <div>
                            {product.category && (
                                <span className="text-sm text-muted-foreground">
                                    {product.category.name}
                                </span>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {product.product_type === 'kit' && (
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        Kit
                                    </span>
                                )}
                                {product.preorder && (
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                                        Preorder Available
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {product.name}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                SKU: {selectedVariant?.sku ?? product.sku}
                            </p>
                        </div>

                        {/* Price */}
                        <p className="text-3xl font-bold">
                            {formatCurrency(displayPrice)}
                        </p>

                        {product.preorder && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                This item is available for preorder. We&apos;ll
                                confirm fulfilment timing after your order is
                                placed.
                            </div>
                        )}

                        {/* Customization — balloon shop text input */}
                        {product.customise_text && (
                            <div className="space-y-3 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    Customize Your Text
                                </h3>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="custom-text"
                                        className="block text-xs text-muted-foreground"
                                    >
                                        Enter the text to print on your balloon
                                    </label>
                                    <input
                                        id="custom-text"
                                        type="text"
                                        value={customText}
                                        onChange={(e) => {
                                            setCustomText(e.target.value);
                                            setValidationMessage('');
                                        }}
                                        placeholder='e.g., "Happy Birthday Sarah!"'
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {customText.length}/500 characters
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-xs text-muted-foreground">
                                        Font style (optional)
                                    </span>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setCustomFont('')}
                                            className={`rounded-md border px-4 py-3 text-left text-sm transition-colors hover:border-primary ${
                                                customFont === ''
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : ''
                                            }`}
                                        >
                                            <span className="block font-medium">
                                                Default
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Uses the standard shop style
                                            </span>
                                        </button>
                                        {FONT_OPTIONS.map((fontOption) => (
                                            <button
                                                key={fontOption.value}
                                                type="button"
                                                onClick={() =>
                                                    setCustomFont(
                                                        fontOption.value,
                                                    )
                                                }
                                                className={`rounded-md border px-4 py-3 text-left text-sm transition-colors hover:border-primary ${
                                                    customFont ===
                                                    fontOption.value
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : ''
                                                }`}
                                            >
                                                <span className="block font-medium">
                                                    {fontOption.label}
                                                </span>
                                                <span
                                                    className="text-sm text-muted-foreground"
                                                    style={{
                                                        fontFamily:
                                                            fontOption.fontFamily,
                                                    }}
                                                >
                                                    Happy Celebration
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Customization — color selectors */}
                        {product.customise_color && (
                            <div className="space-y-3 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">
                                    Choose Your Colors
                                </h3>
                                {/* Primary color */}
                                {(product.main_colors?.length ?? 0) > 0 && (
                                    <div className="space-y-2">
                                        <label className="block text-xs text-muted-foreground">
                                            Primary color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product
                                                .main_colors!.filter(
                                                    (mc) =>
                                                        mc.color_id !==
                                                        secondaryColorId,
                                                )
                                                .map((mc) => (
                                                    <button
                                                        key={mc.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setPrimaryColorId(
                                                                mc.color_id,
                                                            );

                                                            if (
                                                                mc.color_id ===
                                                                secondaryColorId
                                                            ) {
                                                                setSecondaryColorId(
                                                                    null,
                                                                );
                                                            }

                                                            setValidationMessage(
                                                                '',
                                                            );
                                                        }}
                                                        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:border-primary ${
                                                            primaryColorId ===
                                                            mc.color_id
                                                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        {mc.color.hex_code && (
                                                            <span
                                                                className="size-3.5 rounded-full border"
                                                                style={{
                                                                    backgroundColor:
                                                                        mc.color
                                                                            .hex_code,
                                                                }}
                                                            />
                                                        )}
                                                        {mc.color.name}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                                {/* Secondary color */}
                                {(product.secondary_colors?.length ?? 0) >
                                    0 && (
                                    <div className="space-y-2">
                                        <label className="block text-xs text-muted-foreground">
                                            Secondary color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product
                                                .secondary_colors!.filter(
                                                    (sc) =>
                                                        sc.color_id !==
                                                        primaryColorId,
                                                )
                                                .map((sc) => (
                                                    <button
                                                        key={sc.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSecondaryColorId(
                                                                sc.color_id,
                                                            );

                                                            if (
                                                                sc.color_id ===
                                                                primaryColorId
                                                            ) {
                                                                setPrimaryColorId(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:border-primary ${
                                                            secondaryColorId ===
                                                            sc.color_id
                                                                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                                                                : ''
                                                        }`}
                                                    >
                                                        {sc.color.hex_code && (
                                                            <span
                                                                className="size-3.5 rounded-full border"
                                                                style={{
                                                                    backgroundColor:
                                                                        sc.color
                                                                            .hex_code,
                                                                }}
                                                            />
                                                        )}
                                                        {sc.color.name}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {product.product_type === 'kit' &&
                            (product.kit_mappings?.length ?? 0) > 0 && (
                                <div className="rounded-lg border p-4">
                                    <h3 className="text-sm font-medium">
                                        What&apos;s Included
                                    </h3>
                                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                        {product.kit_mappings?.map(
                                            (mapping) => (
                                                <li
                                                    key={mapping.id}
                                                    className="flex items-center justify-between gap-4"
                                                >
                                                    <span>
                                                        {
                                                            mapping.component
                                                                ?.name
                                                        }
                                                        {mapping.variant
                                                            ?.name &&
                                                            ` (${mapping.variant.name})`}
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        x{mapping.quantity}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        {(product.add_ons?.length ?? 0) > 0 && (
                            <div className="space-y-3 rounded-lg border p-4">
                                <div>
                                    <h3 className="text-sm font-medium">
                                        Enhance Your Order
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Add optional extras to this product
                                        before checkout.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {product.add_ons?.map((addOn) => {
                                        const selected =
                                            selectedAddOnIds.includes(addOn.id);
                                        // Prefer combo image (shows add-on paired with this product), then primary, then first
                                        const image =
                                            addOn.images?.find(
                                                (item) =>
                                                    item.binding_type ===
                                                    'addon',
                                            ) ??
                                            addOn.images?.find(
                                                (item) => item.is_primary,
                                            ) ??
                                            addOn.images?.[0];

                                        return (
                                            <button
                                                key={addOn.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleAddOn(addOn.id)
                                                }
                                                className={`rounded-lg border p-3 text-left transition-colors hover:border-primary ${
                                                    selected
                                                        ? 'border-primary bg-primary/5'
                                                        : ''
                                                }`}
                                            >
                                                <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-muted/30">
                                                    {image ? (
                                                        <img
                                                            src={image.url}
                                                            alt={addOn.name}
                                                            className="h-full w-full object-contain"
                                                            onError={(e) => {
                                                                (
                                                                    e.currentTarget as HTMLImageElement
                                                                ).style.display =
                                                                    'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <ShoppingCart className="size-8 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                                <p className="font-medium">
                                                    {addOn.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        addOn.selling_price,
                                                    )}
                                                </p>
                                                <span className="mt-3 inline-flex rounded-md border px-2 py-1 text-xs font-medium">
                                                    {selected ? 'Added' : 'Add'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Add to Cart */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center rounded-md border">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        className="px-3 py-2 hover:bg-muted"
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="min-w-12 text-center text-sm">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="px-3 py-2 hover:bg-muted"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    className="gap-2"
                                    disabled={!canAddToCart}
                                >
                                    <ShoppingCart className="size-4" />
                                    Add to Cart
                                </Button>
                            </div>
                            {!canAddToCart && (
                                <p className="text-sm text-destructive">
                                    {validationMessage ||
                                        missingSelectionMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <div className="rounded-lg border p-6">
                        <h2 className="mb-2 text-lg font-medium">
                            Description
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {product.description}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
