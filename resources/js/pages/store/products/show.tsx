import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { FigmaAnnouncementBar } from '@/components/store/FigmaAnnouncementBar';
import { FigmaFooter } from '@/components/store/FigmaFooter';
import { FigmaHeader } from '@/components/store/FigmaHeader';
import { formatCurrency } from '@/lib/currency';

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
};

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
    main_colors?: Array<{ id: string; color_id: number; color: Color | null }>;
    secondary_colors?: Array<{
        id: string;
        color_id: number;
        color: Color | null;
    }>;
};

type Props = {
    product: Product;
};

type CartForm = {
    product_id: string;
    variant_id: string | null;
    quantity: number;
    customization_text: string;
    customization_font: string;
    customization_primary_color_id: number | null;
    customization_secondary_color_id: number | null;
};

const customizationFonts = ['Script', 'Serif', 'Sans serif'];

export default function ProductShow({ product }: Props) {
    const variants = product.variants ?? [];
    const mainColors = (product.main_colors ?? []).flatMap((entry) =>
        entry.color ? [entry.color] : [],
    );
    const secondaryColors = (product.secondary_colors ?? []).flatMap((entry) =>
        entry.color ? [entry.color] : [],
    );
    const pageProps = usePage().props as unknown as {
        cart?: {
            items?: Array<{
                line_key: string;
                product_id: string;
                variant_id: string | null;
                name: string;
                variant_name: string | null;
                price: string;
                quantity: number;
                image?: string | null;
                customization_text?: string | null;
                customization_primary_color?: {
                    name: string;
                    hex_code?: string | null;
                } | null;
                customization_secondary_color?: {
                    name: string;
                    hex_code?: string | null;
                } | null;
                add_ons?: Array<{ id: string; name: string; price?: string }>;
            }>;
            count: number;
            total: string;
        };
    };
    const cart = pageProps.cart;
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const form = useForm<CartForm>({
        product_id: product.id,
        variant_id: variants[0]?.id ?? null,
        quantity: 1,
        customization_text: '',
        customization_font: customizationFonts[0],
        customization_primary_color_id: mainColors[0]?.id ?? null,
        customization_secondary_color_id: secondaryColors[0]?.id ?? null,
    });

    const selectedVariant = variants.find(
        (variant) => variant.id === form.data.variant_id,
    );
    const primaryColorId = form.data.customization_primary_color_id;
    const variantImages = (product.images ?? []).filter(
        (image) =>
            image.binding_type === 'variant' &&
            image.variant_id === selectedVariant?.id,
    );
    const primaryColorImages = (product.images ?? []).filter(
        (image) =>
            image.binding_type === 'primary_color' &&
            image.primary_color_id === primaryColorId,
    );
    const defaultImages = (product.images ?? []).filter(
        (image) => image.binding_type === 'default',
    );
    const galleryImages =
        variantImages.length > 0
            ? variantImages
            : primaryColorImages.length > 0
              ? primaryColorImages
              : defaultImages;
    const selectedImage =
        galleryImages.find((image) => image.id === selectedImageId) ??
        galleryImages[0];
    const selectedPrice =
        Number(product.selling_price) +
        Number(selectedVariant?.price_adjustment ?? 0);
    const attributes =
        selectedVariant?.variant_attributes?.flatMap((item) => {
            const value = item.attribute_value;

            return value?.attribute
                ? [`${value.attribute.name}: ${value.value}`]
                : value
                  ? [value.value]
                  : [];
        }) ?? [];

    const addToCart = () => {
        form.transform((data) => ({
            ...data,
            customization_text: product.customise_text
                ? data.customization_text.trim()
                : '',
            customization_font: product.customise_text
                ? data.customization_font
                : '',
            customization_primary_color_id: product.customise_color
                ? data.customization_primary_color_id
                : null,
            customization_secondary_color_id: product.customise_color
                ? data.customization_secondary_color_id
                : null,
        }));
        form.post('/cart/add', {
            preserveScroll: true,
            onSuccess: () => toast.success('Added to your bag.'),
        });
    };

    const selectColor = (
        field:
            | 'customization_primary_color_id'
            | 'customization_secondary_color_id',
        colorId: number,
    ) => {
        form.setData(field, colorId);
        setSelectedImageId(null);
    };

    return (
        <>
            <Head title={product.name} />

            <a
                href="#product-details"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:bg-popjoy-purple focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to product details
            </a>

            <div className="min-h-screen w-full bg-popjoy-bg">
                <FigmaAnnouncementBar />
                <FigmaHeader onCartClick={() => setCartOpen(true)} />

                <main
                    id="product-details"
                    className="mx-auto w-full max-w-7xl px-4 py-6 text-popjoy-ink sm:px-6 sm:py-10 lg:px-8"
                >
                    <nav
                        aria-label="Breadcrumb"
                        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-popjoy-muted"
                    >
                        <Link
                            href="/"
                            className="rounded-sm transition-colors hover:text-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                        >
                            Home
                        </Link>
                        <span aria-hidden="true">/</span>
                        {product.category ? (
                            <>
                                <Link
                                    href={`/categories/${product.category.id}`}
                                    className="rounded-sm transition-colors hover:text-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                                >
                                    {product.category.name}
                                </Link>
                                <span aria-hidden="true">/</span>
                            </>
                        ) : null}
                        <span
                            aria-current="page"
                            className="line-clamp-1 text-popjoy-ink"
                        >
                            {product.name}
                        </span>
                    </nav>

                    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-12">
                        <section
                            aria-label={`${product.name} photos`}
                            className="space-y-4"
                        >
                            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_8px_30px_-18px_rgba(47,22,91,0.28)] sm:rounded-[2.5rem] sm:p-8">
                                {selectedImage ? (
                                    <img
                                        key={selectedImage.id}
                                        src={selectedImage.url}
                                        alt={
                                            selectedImage.alt_text ||
                                            product.name
                                        }
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <div className="flex size-full flex-col items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-popjoy-purple-bg via-white to-popjoy-purple-surface/50 text-center">
                                        <span
                                            aria-hidden="true"
                                            className="text-7xl text-popjoy-purple/50 sm:text-8xl"
                                        >
                                            🎈
                                        </span>
                                        <span className="mt-4 max-w-xs font-plus-jakarta text-lg font-semibold">
                                            {product.name}
                                        </span>
                                        <span className="mt-1 text-sm text-popjoy-muted">
                                            Product photos coming soon
                                        </span>
                                    </div>
                                )}
                            </div>

                            {galleryImages.length > 1 && (
                                <div
                                    aria-label="Choose a product photo"
                                    className="grid grid-cols-4 gap-3 sm:grid-cols-5"
                                >
                                    {galleryImages.map((image, index) => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            aria-label={`Show photo ${index + 1}`}
                                            aria-pressed={
                                                selectedImage?.id === image.id
                                            }
                                            onClick={() =>
                                                setSelectedImageId(image.id)
                                            }
                                            className={`aspect-square overflow-hidden rounded-2xl border-2 bg-white p-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple ${
                                                selectedImage?.id === image.id
                                                    ? 'border-popjoy-purple shadow-sm'
                                                    : 'border-transparent hover:border-popjoy-purple-surface'
                                            }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt=""
                                                className="size-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="min-w-0">
                            <div className="rounded-[2rem] border border-popjoy-divider/40 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(47,22,91,0.22)] sm:p-8">
                                <p className="text-xs font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                                    {product.category?.name ?? 'Party Eden'}
                                </p>
                                <h1 className="mt-2 font-plus-jakarta text-3xl leading-tight font-bold tracking-tight text-popjoy-ink sm:text-4xl">
                                    {product.name}
                                </h1>
                                <p className="mt-2 text-xs font-medium tracking-wide text-popjoy-muted">
                                    Product code: {product.sku}
                                </p>
                                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <p className="font-plus-jakarta text-3xl font-bold text-popjoy-ink">
                                        {formatCurrency(
                                            selectedPrice.toFixed(2),
                                        )}
                                    </p>
                                    <span className="text-sm text-popjoy-muted">
                                        per {product.unit}
                                    </span>
                                    {product.preorder && (
                                        <span className="rounded-full bg-popjoy-gold/25 px-3 py-1 text-xs font-semibold text-popjoy-gold-ink">
                                            Available to preorder
                                        </span>
                                    )}
                                </div>

                                {product.description && (
                                    <p className="mt-5 text-sm leading-7 whitespace-pre-line text-popjoy-muted">
                                        {product.description}
                                    </p>
                                )}

                                <div className="mt-7 space-y-7 border-t border-popjoy-divider/50 pt-6">
                                    {variants.length > 0 && (
                                        <fieldset>
                                            <legend className="font-plus-jakarta text-sm font-bold">
                                                Choose an option
                                            </legend>
                                            {selectedVariant && (
                                                <p className="mt-1 text-xs text-popjoy-muted">
                                                    {attributes.length > 0
                                                        ? attributes.join(' · ')
                                                        : selectedVariant.name}
                                                </p>
                                            )}
                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                {variants.map((variant) => {
                                                    const variantAttributes =
                                                        variant.variant_attributes?.flatMap(
                                                            (item) => {
                                                                const value =
                                                                    item.attribute_value;

                                                                return value?.attribute
                                                                    ? [
                                                                          `${value.attribute.name}: ${value.value}`,
                                                                      ]
                                                                    : value
                                                                      ? [
                                                                            value.value,
                                                                        ]
                                                                      : [];
                                                            },
                                                        ) ?? [];
                                                    const variantLabel =
                                                        variantAttributes.join(
                                                            ' · ',
                                                        ) ||
                                                        variant.name ||
                                                        variant.sku;
                                                    const adjustment = Number(
                                                        variant.price_adjustment,
                                                    );

                                                    return (
                                                        <button
                                                            key={variant.id}
                                                            type="button"
                                                            aria-pressed={
                                                                form.data
                                                                    .variant_id ===
                                                                variant.id
                                                            }
                                                            onClick={() => {
                                                                form.setData(
                                                                    'variant_id',
                                                                    variant.id,
                                                                );
                                                                setSelectedImageId(
                                                                    null,
                                                                );
                                                            }}
                                                            className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple ${
                                                                form.data
                                                                    .variant_id ===
                                                                variant.id
                                                                    ? 'border-popjoy-purple bg-popjoy-purple-bg/70'
                                                                    : 'border-popjoy-divider/60 hover:border-popjoy-purple-surface'
                                                            }`}
                                                        >
                                                            <span className="min-w-0">
                                                                <span className="block truncate text-sm font-semibold">
                                                                    {
                                                                        variantLabel
                                                                    }
                                                                </span>
                                                                {variant.name &&
                                                                    variantAttributes.length >
                                                                        0 && (
                                                                        <span className="mt-0.5 block truncate text-xs text-popjoy-muted">
                                                                            {
                                                                                variant.name
                                                                            }
                                                                        </span>
                                                                    )}
                                                            </span>
                                                            <span className="shrink-0 text-xs font-semibold text-popjoy-muted">
                                                                {adjustment ===
                                                                0
                                                                    ? 'Included'
                                                                    : `${adjustment > 0 ? '+' : '−'}${formatCurrency(Math.abs(adjustment).toFixed(2))}`}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {form.errors.variant_id && (
                                                <p className="mt-2 text-sm text-destructive">
                                                    {form.errors.variant_id}
                                                </p>
                                            )}
                                        </fieldset>
                                    )}

                                    {product.customise_color && (
                                        <div className="space-y-4 sm:space-y-6">
                                            {[
                                                {
                                                    label: 'Main colour',
                                                    field: 'customization_primary_color_id' as const,
                                                    colors: mainColors,
                                                    selectedId:
                                                        form.data
                                                            .customization_primary_color_id,
                                                },
                                                {
                                                    label: 'Secondary colour',
                                                    field: 'customization_secondary_color_id' as const,
                                                    colors: secondaryColors,
                                                    selectedId:
                                                        form.data
                                                            .customization_secondary_color_id,
                                                },
                                            ].map((group) => (
                                                <fieldset key={group.field}>
                                                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                                        <legend className="font-plus-jakarta text-sm font-bold">
                                                            {group.label}
                                                        </legend>
                                                        {group.colors.length >
                                                            0 && (
                                                            <span className="text-xs text-popjoy-muted">
                                                                {group.colors.find(
                                                                    (color) =>
                                                                        color.id ===
                                                                        group.selectedId,
                                                                )?.name ??
                                                                    'Select a colour'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {group.colors.length > 0 ? (
                                                        <>
                                                            <div className="mt-2 flex flex-wrap gap-2 sm:mt-3 sm:gap-3">
                                                                {group.colors.map(
                                                                    (color) => (
                                                                        <button
                                                                            key={
                                                                                color.id
                                                                            }
                                                                            type="button"
                                                                            title={
                                                                                color.name
                                                                            }
                                                                            aria-label={`${group.label}: ${color.name}`}
                                                                            aria-pressed={
                                                                                group.selectedId ===
                                                                                color.id
                                                                            }
                                                                            onClick={() =>
                                                                                selectColor(
                                                                                    group.field,
                                                                                    color.id,
                                                                                )
                                                                            }
                                                                            className={`relative flex size-9 items-center justify-center rounded-full border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple sm:size-11 ${
                                                                                group.selectedId ===
                                                                                color.id
                                                                                    ? 'border-popjoy-purple ring-2 ring-popjoy-purple/20 ring-offset-1 sm:ring-offset-2'
                                                                                    : 'border-white shadow-sm hover:ring-2 hover:ring-popjoy-divider'
                                                                            }`}
                                                                            style={{
                                                                                backgroundColor:
                                                                                    color.hex_code ??
                                                                                    '#e5e7eb',
                                                                            }}
                                                                        >
                                                                            {group.selectedId ===
                                                                                color.id && (
                                                                                <Check
                                                                                    aria-hidden="true"
                                                                                    className={`size-4 ${
                                                                                        color.hex_code?.toLowerCase() ===
                                                                                        '#ffffff'
                                                                                            ? 'text-popjoy-ink'
                                                                                            : 'text-white drop-shadow'
                                                                                    }`}
                                                                                />
                                                                            )}
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="mt-2 rounded-xl bg-popjoy-purple-bg/70 px-4 py-3 text-sm text-popjoy-muted">
                                                            Colour options are
                                                            not available for
                                                            this product yet.
                                                        </p>
                                                    )}
                                                    {form.errors[
                                                        group.field
                                                    ] && (
                                                        <p className="mt-2 text-sm text-destructive">
                                                            {
                                                                form.errors[
                                                                    group.field
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </fieldset>
                                            ))}
                                        </div>
                                    )}

                                    {product.customise_text && (
                                        <div>
                                            <label
                                                htmlFor="customization-text"
                                                className="font-plus-jakarta text-sm font-bold"
                                            >
                                                Your personal message
                                            </label>
                                            <p className="mt-1 text-xs text-popjoy-muted">
                                                Add a name, age or short message
                                                for your balloon.
                                            </p>
                                            <textarea
                                                id="customization-text"
                                                maxLength={500}
                                                rows={3}
                                                value={
                                                    form.data.customization_text
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'customization_text',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="For example, Happy 30th Birthday, Alex!"
                                                className="mt-3 w-full resize-y rounded-2xl border border-popjoy-divider/70 bg-white px-4 py-3 text-sm leading-6 transition outline-none placeholder:text-popjoy-muted-light focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                                            />
                                            <div className="mt-2 flex items-center justify-between gap-4">
                                                <label
                                                    htmlFor="customization-font"
                                                    className="text-xs font-semibold text-popjoy-muted"
                                                >
                                                    Lettering style
                                                </label>
                                                <select
                                                    id="customization-font"
                                                    value={
                                                        form.data
                                                            .customization_font
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'customization_font',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="rounded-lg border border-popjoy-divider/70 bg-white px-3 py-2 text-sm outline-none focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                                                >
                                                    {customizationFonts.map(
                                                        (font) => (
                                                            <option
                                                                key={font}
                                                                value={font}
                                                            >
                                                                {font}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                            <p className="mt-2 text-right text-xs text-popjoy-muted">
                                                {
                                                    form.data.customization_text
                                                        .length
                                                }
                                                /500
                                            </p>
                                            {form.errors.customization_text && (
                                                <p className="mt-2 text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .customization_text
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={addToCart}
                                        disabled={form.processing}
                                        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-popjoy-purple px-6 py-4 font-plus-jakarta text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(99,14,212,0.6)] transition hover:bg-popjoy-purple/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <ShoppingBag
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                        {form.processing
                                            ? 'Adding to your bag…'
                                            : 'Add to bag'}
                                    </button>
                                    <p className="text-center text-xs leading-5 text-popjoy-muted">
                                        Your selected options and
                                        personalisation are saved with your
                                        order.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-popjoy-divider/40 bg-white px-4 py-4">
                                    <p className="text-sm font-bold">
                                        Carefully prepared
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-popjoy-muted">
                                        Each order is packed with care for your
                                        celebration.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-popjoy-divider/40 bg-white px-4 py-4">
                                    <p className="text-sm font-bold">
                                        Need a hand?
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-popjoy-muted">
                                        Contact us if you need help choosing the
                                        right option.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <FigmaFooter />
            </div>

            {/* Celebration basket drawer */}
            <CartSidebar
                cart={{
                    items: cart?.items ?? [],
                    count: cart?.count ?? 0,
                    total: cart?.total ?? '0',
                }}
                open={cartOpen}
                onClose={() => setCartOpen(false)}
            />
        </>
    );
}
