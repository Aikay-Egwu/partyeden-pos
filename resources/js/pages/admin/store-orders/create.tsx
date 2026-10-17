import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Copy,
    HelpCircle,
    Loader2,
    Mail,
    MessageCircle,
    Package,
    Phone,
    Plus,
    Search,
    Trash2,
    Truck,
    Store,
    Calendar,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/currency';

type ColorOption = {
    id: number;
    name: string;
    hex_code: string;
};

type DeliveryZoneOption = {
    id: string;
    name: string;
    delivery_price: string;
    prefixes: { code_prefix: string }[];
};

type ProductSearchResult = {
    id: string;
    name: string;
    sku: string;
    selling_price: number;
    customise_text: boolean;
    customise_color: boolean;
    preorder: boolean;
    image_url: string | null;
    variants: Array<{
        id: string;
        name: string;
        sku: string;
        price_adjustment: number;
        price: number;
    }>;
    main_colors: ColorOption[];
    secondary_colors: ColorOption[];
};

type SelectedItem = {
    product_id: string;
    variant_id: string | null;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    customise_text: boolean;
    customise_color: boolean;
    customization_text: string;
    customization_font: string;
    customization_primary_color_id: number | null;
    customization_secondary_color_id: number | null;
    instructions: string;
    image_url: string | null;
    available_main_colors: ColorOption[];
    available_secondary_colors: ColorOption[];
};

type Props = {
    availableColors: ColorOption[];
    deliveryZones: DeliveryZoneOption[];
    checkoutTimezone: string;
};

const CUSTOMIZATION_FONTS = ['Script', 'Serif', 'Sans serif'];

export default function CreateStoreOrder({
    availableColors,
    deliveryZones,
    checkoutTimezone,
}: Props) {
    // Form state via Inertia useForm
    const { data, setData, post, processing, errors } = useForm({
        order_source: 'whatsapp' as 'phone' | 'whatsapp',
        fulfillment_type: 'pickup' as 'pickup' | 'delivery',
        expected_at: '',
        notes: '',
        delivery_postcode: '',
        shipping_address_line1: '',
        shipping_address_line2: '',
        shipping_city: '',
        shipping_amount: 0,
        customer: {
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
        },
        send_link_via: 'copy' as 'email' | 'copy' | 'none',
        items: [] as SelectedItem[],
    });

    // Product search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ProductSearchResult[]>(
        [],
    );
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductSearchResult | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('base');
    const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(
        null,
    );

    // Success modal state
    const [successOrder, setSuccessOrder] = useState<{
        id: string;
        orderNumber: string;
        paymentLinkUrl: string | null;
        customerPhone: string;
        customerName: string;
    } | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);

    // Debounced product search
    useEffect(() => {
        const trimmed = searchQuery.trim();

        if (!trimmed) {
            return;
        }

        const handler = setTimeout(async () => {
            setIsSearching(true);

            try {
                const response = await fetch(
                    `/admin/store-orders/products?query=${encodeURIComponent(trimmed)}`,
                );

                if (response.ok) {
                    const data: ProductSearchResult[] = await response.json();

                    setSearchResults(data);
                }
            } catch (err) {
                console.error('Failed to search products', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Live postcode matching to delivery zones
    const matchedZone = useMemo(() => {
        if (data.fulfillment_type !== 'delivery' || !data.delivery_postcode) {
            return null;
        }

        const normalized = data.delivery_postcode
            .toUpperCase()
            .replace(/\s+/g, '');

        if (!normalized) {
            return null;
        }

        for (const zone of deliveryZones) {
            for (const prefix of zone.prefixes) {
                const normPrefix = prefix.code_prefix
                    .toUpperCase()
                    .replace(/\s+/g, '');

                if (normalized.startsWith(normPrefix)) {
                    return zone;
                }
            }
        }

        return null;
    }, [data.fulfillment_type, data.delivery_postcode, deliveryZones]);

    // Automatically update shipping amount when zone is matched
    useEffect(() => {
        if (matchedZone) {
            setData('shipping_amount', parseFloat(matchedZone.delivery_price));
        } else if (data.fulfillment_type === 'pickup') {
            setData('shipping_amount', 0);
        }
    }, [matchedZone, data.fulfillment_type, setData]);

    // Add selected product / variant to order items
    const handleAddProductToOrder = () => {
        if (!selectedProduct) {
            return;
        }

        const isVariant = selectedVariantId !== 'base';
        const variant = isVariant
            ? selectedProduct.variants.find((v) => v.id === selectedVariantId)
            : null;

        const unitPrice = variant
            ? variant.price
            : selectedProduct.selling_price;
        const variantName = variant ? variant.name : null;

        const newItem: SelectedItem = {
            product_id: selectedProduct.id,
            variant_id: variant ? variant.id : null,
            product_name: selectedProduct.name,
            variant_name: variantName,
            quantity: 1,
            unit_price: unitPrice,
            customise_text: selectedProduct.customise_text,
            customise_color: selectedProduct.customise_color,
            customization_text: '',
            customization_font: CUSTOMIZATION_FONTS[0],
            customization_primary_color_id:
                selectedProduct.main_colors[0]?.id ?? null,
            customization_secondary_color_id:
                selectedProduct.secondary_colors[0]?.id ?? null,
            instructions: '',
            image_url: selectedProduct.image_url,
            available_main_colors:
                selectedProduct.main_colors.length > 0
                    ? selectedProduct.main_colors
                    : availableColors,
            available_secondary_colors:
                selectedProduct.secondary_colors.length > 0
                    ? selectedProduct.secondary_colors
                    : availableColors,
        };

        setData('items', [...data.items, newItem]);
        setSelectedProduct(null);
        setSelectedVariantId('base');
        setSearchQuery('');
        setSearchResults([]);
        toast.success(`Added ${selectedProduct.name} to order.`);
    };

    // Remove item
    const handleRemoveItem = (index: number) => {
        const next = [...data.items];
        next.splice(index, 1);
        setData('items', next);
    };

    // Update item field
    const handleUpdateItem = <K extends keyof SelectedItem>(
        index: number,
        field: K,
        value: SelectedItem[K],
    ) => {
        const next = [...data.items];
        next[index] = {
            ...next[index],
            [field]: value,
        };
        setData('items', next);
    };

    // Computed totals
    const subtotal = useMemo(() => {
        return data.items.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0,
        );
    }, [data.items]);

    const total = useMemo(() => {
        const shipping =
            data.fulfillment_type === 'delivery'
                ? Number(data.shipping_amount) || 0
                : 0;

        return Math.max(0, subtotal + shipping);
    }, [subtotal, data.fulfillment_type, data.shipping_amount]);

    // Handle submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.items.length === 0) {
            toast.error('Please add at least one product to the order.');

            return;
        }

        if (!data.customer.first_name || !data.customer.last_name) {
            toast.error('Customer first and last name are required.');

            return;
        }

        if (!data.customer.phone && data.order_source !== 'phone') {
            toast.error('Phone number is required for WhatsApp orders.');

            return;
        }

        if (data.send_link_via === 'email' && !data.customer.email) {
            toast.error('Customer email is required to send link via email.');

            return;
        }

        if (!data.expected_at) {
            toast.error(
                'Please select an expected collection/delivery date and time.',
            );

            return;
        }

        post('/admin/store-orders', {
            onSuccess: (page) => {
                const flash = (page.props as any).flash;
                const linkUrl = flash?.payment_link_url ?? null;
                const successMsg =
                    flash?.success ?? 'Order created successfully.';

                toast.success(successMsg);

                // Open post-submit dialog if payment link exists
                if (linkUrl) {
                    setSuccessOrder({
                        id: (page.props as any).order?.id ?? '',
                        orderNumber:
                            (page.props as any).order?.order_number ??
                            'Confirmed',
                        paymentLinkUrl: linkUrl,
                        customerPhone: data.customer.phone,
                        customerName: `${data.customer.first_name} ${data.customer.last_name}`,
                    });
                }
            },
            onError: (errs) => {
                const firstError = Object.values(errs)[0];

                toast.error(
                    typeof firstError === 'string'
                        ? firstError
                        : 'Failed to create store order. Check the form.',
                );
            },
        });
    };

    const handleCopyPaymentLink = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        toast.success('Payment link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const buildWhatsAppShareUrl = (
        phone: string,
        customerName: string,
        orderNumber: string,
        url: string,
    ) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = `Hi ${customerName}, here is your secure Stripe payment link for Party Eden Order #${orderNumber}:\n\n${url}\n\nThank you for ordering with us!`;

        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <>
            <Head title="Create Store Order — Phone & WhatsApp" />

            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b pb-2 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href="/admin/orders">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Back to orders"
                                >
                                    <ArrowLeft className="size-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Create Store Order
                            </h1>
                        </div>
                        <p className="mt-1 ml-10 text-sm text-muted-foreground">
                            Create phone or WhatsApp orders on behalf of
                            customers and instantly generate a Stripe Payment
                            Link.
                        </p>
                    </div>

                    <div className="ml-10 flex items-center gap-2 sm:ml-0">
                        <Badge
                            variant={
                                data.order_source === 'whatsapp'
                                    ? 'default'
                                    : 'outline'
                            }
                            className="gap-1.5 px-3 py-1"
                        >
                            {data.order_source === 'whatsapp' ? (
                                <>
                                    <MessageCircle className="size-3.5 text-emerald-400" />
                                    WhatsApp Order
                                </>
                            ) : (
                                <>
                                    <Phone className="size-3.5 text-blue-400" />
                                    Phone Call Order
                                </>
                            )}
                        </Badge>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                >
                    {/* LEFT / MAIN COLUMN: Order Data Entry */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* 1. Order Source Selection */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <span>1. Order Origin</span>
                                </CardTitle>
                                <CardDescription>
                                    How did the customer contact you?
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('order_source', 'whatsapp')
                                        }
                                        className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                                            data.order_source === 'whatsapp'
                                                ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-200'
                                                : 'border-border bg-card hover:border-muted-foreground/30'
                                        }`}
                                    >
                                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                            <MessageCircle className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">
                                                WhatsApp
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Order via WhatsApp chat
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('order_source', 'phone')
                                        }
                                        className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                                            data.order_source === 'phone'
                                                ? 'border-blue-600 bg-blue-50/50 text-blue-950 dark:bg-blue-950/20 dark:text-blue-200'
                                                : 'border-border bg-card hover:border-muted-foreground/30'
                                        }`}
                                    >
                                        <div className="rounded-full bg-blue-100 p-2 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                            <Phone className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">
                                                Phone Call
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Direct telephone order
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Customer Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    2. Customer Details
                                </CardTitle>
                                <CardDescription>
                                    Customer contact information for
                                    notifications and delivery
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="first_name">
                                            First Name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="first_name"
                                            placeholder="Jane"
                                            value={data.customer.first_name}
                                            onChange={(e) =>
                                                setData('customer', {
                                                    ...data.customer,
                                                    first_name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        {errors['customer.first_name'] && (
                                            <p className="text-xs text-destructive">
                                                {errors['customer.first_name']}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="last_name">
                                            Last Name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="last_name"
                                            placeholder="Doe"
                                            value={data.customer.last_name}
                                            onChange={(e) =>
                                                setData('customer', {
                                                    ...data.customer,
                                                    last_name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        {errors['customer.last_name'] && (
                                            <p className="text-xs text-destructive">
                                                {errors['customer.last_name']}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone">
                                            Phone / WhatsApp Number{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+44 7123 456789"
                                            value={data.customer.phone}
                                            onChange={(e) =>
                                                setData('customer', {
                                                    ...data.customer,
                                                    phone: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        {errors['customer.phone'] && (
                                            <p className="text-xs text-destructive">
                                                {errors['customer.phone']}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="email"
                                            className="flex items-center justify-between"
                                        >
                                            <span>Email Address</span>
                                            <span className="text-xs font-normal text-muted-foreground">
                                                Optional
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="jane@example.com"
                                            value={data.customer.email}
                                            onChange={(e) =>
                                                setData('customer', {
                                                    ...data.customer,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                        {errors['customer.email'] && (
                                            <p className="text-xs text-destructive">
                                                {errors['customer.email']}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Product Catalog Search & Add Items */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    3. Select Products & Customizations
                                </CardTitle>
                                <CardDescription>
                                    Search products by name or SKU, choose
                                    variants, and specify balloon texts or
                                    colors
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search input */}
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Type product name or SKU to search..."
                                        className="pr-9 pl-9"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);

                                            if (!e.target.value.trim()) {
                                                setSearchResults([]);
                                            }
                                        }}
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute top-2.5 right-3 size-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {/* Search results drop-panel */}
                                {searchResults.length > 0 && (
                                    <div className="max-h-64 divide-y overflow-y-auto rounded-lg border bg-card shadow-sm">
                                        {searchResults.map((p) => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setSelectedVariantId(
                                                        p.variants.length > 0
                                                            ? p.variants[0].id
                                                            : 'base',
                                                    );
                                                }}
                                                className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                                                    selectedProduct?.id === p.id
                                                        ? 'border-l-4 border-l-primary bg-primary/10'
                                                        : 'hover:bg-accent/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {p.image_url ? (
                                                        <img
                                                            src={p.image_url}
                                                            alt={p.name}
                                                            className="size-10 rounded-md border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                                            <Package className="size-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium">
                                                            {p.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>
                                                                SKU: {p.sku}
                                                            </span>
                                                            {p.variants.length >
                                                                0 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="h-4 px-1.5 py-0 text-[10px]"
                                                                >
                                                                    {
                                                                        p
                                                                            .variants
                                                                            .length
                                                                    }{' '}
                                                                    variants
                                                                </Badge>
                                                            )}
                                                            {p.preorder && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="h-4 px-1.5 py-0 text-[10px] text-amber-600"
                                                                >
                                                                    Preorder
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-sm font-semibold">
                                                        {formatCurrency(
                                                            p.selling_price,
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-primary">
                                                        Select
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Selected product configuration box */}
                                {selectedProduct && (
                                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Check className="size-4 text-emerald-600" />
                                                Selected:{' '}
                                                <strong>
                                                    {selectedProduct.name}
                                                </strong>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedProduct(null)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>

                                        {/* Variant selection dropdown - lets the admin
                                            order the main product ("base") or one of its variants */}
                                        {selectedProduct.variants.length >
                                            0 && (
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">
                                                    Choose Variant
                                                </Label>
                                                <select
                                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                                    value={selectedVariantId}
                                                    onChange={(e) =>
                                                        setSelectedVariantId(
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    {/* "base" means the product itself, without a variant */}
                                                    <option value="base">
                                                        Main product (
                                                        {formatCurrency(
                                                            selectedProduct.selling_price,
                                                        )}
                                                        )
                                                    </option>
                                                    {selectedProduct.variants.map(
                                                        (v) => (
                                                            <option
                                                                key={v.id}
                                                                value={v.id}
                                                            >
                                                                {v.name} (
                                                                {formatCurrency(
                                                                    v.price,
                                                                )}
                                                                )
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={handleAddProductToOrder}
                                            className="w-full gap-2"
                                        >
                                            <Plus className="size-4" />
                                            Add to Order (
                                            {formatCurrency(
                                                selectedVariantId !== 'base'
                                                    ? (selectedProduct.variants.find(
                                                          (v) =>
                                                              v.id ===
                                                              selectedVariantId,
                                                      )?.price ??
                                                          selectedProduct.selling_price)
                                                    : selectedProduct.selling_price,
                                            )}
                                            )
                                        </Button>
                                    </div>
                                )}

                                {/* Items table */}
                                {data.items.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed py-8 text-center text-muted-foreground">
                                        <Package className="mx-auto mb-2 size-8 opacity-50" />
                                        <p className="text-sm font-medium">
                                            No products added yet
                                        </p>
                                        <p className="text-xs">
                                            Use the search bar above to find and
                                            add products
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Order Items ({data.items.length})
                                        </div>

                                        {data.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="space-y-3 rounded-lg border bg-card p-3.5 transition-shadow hover:shadow-xs"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.image_url ? (
                                                            <img
                                                                src={
                                                                    item.image_url
                                                                }
                                                                alt={
                                                                    item.product_name
                                                                }
                                                                className="size-12 rounded-md border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                                                <Package className="size-6" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-semibold">
                                                                {
                                                                    item.product_name
                                                                }
                                                                {item.variant_name && (
                                                                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                                                        —{' '}
                                                                        {
                                                                            item.variant_name
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                                <span>
                                                                    Unit Price:
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    <span>
                                                                        £
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        className="h-6 w-16 rounded border bg-background px-1 text-xs"
                                                                        value={
                                                                            item.unit_price
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleUpdateItem(
                                                                                idx,
                                                                                'unit_price',
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    0,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {/* Quantity stepper */}
                                                        <div className="flex items-center rounded-md border">
                                                            <button
                                                                type="button"
                                                                className="px-2.5 py-1 text-xs font-bold hover:bg-muted"
                                                                onClick={() =>
                                                                    handleUpdateItem(
                                                                        idx,
                                                                        'quantity',
                                                                        Math.max(
                                                                            1,
                                                                            item.quantity -
                                                                                1,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-2 text-xs font-semibold">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="px-2.5 py-1 text-xs font-bold hover:bg-muted"
                                                                onClick={() =>
                                                                    handleUpdateItem(
                                                                        idx,
                                                                        'quantity',
                                                                        item.quantity +
                                                                            1,
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="w-16 text-right text-sm font-bold">
                                                            {formatCurrency(
                                                                item.unit_price *
                                                                    item.quantity,
                                                            )}
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    idx,
                                                                )
                                                            }
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Customization toggler / fields */}
                                                {(item.customise_text ||
                                                    item.customise_color ||
                                                    item.instructions) && (
                                                    <div className="border-t pt-2">
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                            onClick={() =>
                                                                setExpandedItemIndex(
                                                                    expandedItemIndex ===
                                                                        idx
                                                                        ? null
                                                                        : idx,
                                                                )
                                                            }
                                                        >
                                                            {expandedItemIndex ===
                                                            idx ? (
                                                                <ChevronUp className="size-3.5" />
                                                            ) : (
                                                                <ChevronDown className="size-3.5" />
                                                            )}
                                                            Customization &
                                                            Special Instructions
                                                        </button>

                                                        {expandedItemIndex ===
                                                            idx && (
                                                            <div className="mt-2.5 space-y-3 rounded-md bg-muted/40 p-3 text-xs">
                                                                {/* Customization text */}
                                                                {item.customise_text && (
                                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Custom
                                                                                Text
                                                                                (on
                                                                                balloon
                                                                                /
                                                                                item)
                                                                            </Label>
                                                                            <Input
                                                                                placeholder="e.g. Happy 30th Birthday Emma!"
                                                                                className="h-8 bg-background text-xs"
                                                                                value={
                                                                                    item.customization_text
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleUpdateItem(
                                                                                        idx,
                                                                                        'customization_text',
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Font
                                                                                Style
                                                                            </Label>
                                                                            <select
                                                                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                                                                value={
                                                                                    item.customization_font
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleUpdateItem(
                                                                                        idx,
                                                                                        'customization_font',
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            >
                                                                                {CUSTOMIZATION_FONTS.map(
                                                                                    (
                                                                                        font,
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                font
                                                                                            }
                                                                                            value={
                                                                                                font
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                font
                                                                                            }
                                                                                        </option>
                                                                                    ),
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Colors */}
                                                                {item.customise_color && (
                                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Primary
                                                                                Color
                                                                            </Label>
                                                                            <select
                                                                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                                                                value={
                                                                                    item.customization_primary_color_id ??
                                                                                    ''
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleUpdateItem(
                                                                                        idx,
                                                                                        'customization_primary_color_id',
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                            ? parseInt(
                                                                                                  e
                                                                                                      .target
                                                                                                      .value,
                                                                                              )
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <option value="">
                                                                                    None
                                                                                    /
                                                                                    Default
                                                                                </option>
                                                                                {item.available_main_colors.map(
                                                                                    (
                                                                                        c,
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                c.id
                                                                                            }
                                                                                            value={
                                                                                                c.id
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                c.name
                                                                                            }
                                                                                        </option>
                                                                                    ),
                                                                                )}
                                                                            </select>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Secondary
                                                                                Color
                                                                            </Label>
                                                                            <select
                                                                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                                                                value={
                                                                                    item.customization_secondary_color_id ??
                                                                                    ''
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleUpdateItem(
                                                                                        idx,
                                                                                        'customization_secondary_color_id',
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                            ? parseInt(
                                                                                                  e
                                                                                                      .target
                                                                                                      .value,
                                                                                              )
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <option value="">
                                                                                    None
                                                                                    /
                                                                                    Default
                                                                                </option>
                                                                                {item.available_secondary_colors.map(
                                                                                    (
                                                                                        c,
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                c.id
                                                                                            }
                                                                                            value={
                                                                                                c.id
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                c.name
                                                                                            }
                                                                                        </option>
                                                                                    ),
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Item specific instructions */}
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs">
                                                                        Item-Specific
                                                                        Instructions
                                                                    </Label>
                                                                    <Input
                                                                        placeholder="e.g. Include matching ribbon, extra weight..."
                                                                        className="h-8 bg-background text-xs"
                                                                        value={
                                                                            item.instructions
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleUpdateItem(
                                                                                idx,
                                                                                'instructions',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 4. Fulfillment & Delivery Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    4. Fulfillment & Schedule
                                </CardTitle>
                                <CardDescription>
                                    Select pickup or delivery and set expected
                                    date & time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'fulfillment_type',
                                                'pickup',
                                            )
                                        }
                                        className={`flex items-center gap-3 rounded-lg border-2 p-3.5 text-left transition-all ${
                                            data.fulfillment_type === 'pickup'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-muted-foreground/30'
                                        }`}
                                    >
                                        <Store className="size-5" />
                                        <div>
                                            <div className="text-sm font-semibold">
                                                Store Collection / Pickup
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Customer collects in store
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'fulfillment_type',
                                                'delivery',
                                            )
                                        }
                                        className={`flex items-center gap-3 rounded-lg border-2 p-3.5 text-left transition-all ${
                                            data.fulfillment_type === 'delivery'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-muted-foreground/30'
                                        }`}
                                    >
                                        <Truck className="size-5" />
                                        <div>
                                            <div className="text-sm font-semibold">
                                                Local Delivery
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Deliver to customer address
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {data.fulfillment_type === 'delivery' && (
                                    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="postcode">
                                                    Postcode{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="postcode"
                                                    placeholder="e.g. BR1 1AA"
                                                    value={
                                                        data.delivery_postcode
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'delivery_postcode',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                {matchedZone ? (
                                                    <p className="text-xs font-medium text-emerald-600">
                                                        ✓ Zone Matched:{' '}
                                                        {matchedZone.name} (
                                                        {formatCurrency(
                                                            matchedZone.delivery_price,
                                                        )}
                                                        )
                                                    </p>
                                                ) : (
                                                    data.delivery_postcode && (
                                                        <p className="flex items-center gap-1 text-xs text-amber-600">
                                                            <HelpCircle className="size-3" />
                                                            No zone
                                                            auto-matched;
                                                            specify shipping
                                                            charge manually.
                                                        </p>
                                                    )
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="shipping_amount">
                                                    Delivery Charge (£)
                                                </Label>
                                                <Input
                                                    id="shipping_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.shipping_amount}
                                                    onChange={(e) =>
                                                        setData(
                                                            'shipping_amount',
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="address_line1">
                                                Address Line 1{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="address_line1"
                                                placeholder="Street address, house number"
                                                value={
                                                    data.shipping_address_line1
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'shipping_address_line1',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="address_line2">
                                                    Address Line 2
                                                </Label>
                                                <Input
                                                    id="address_line2"
                                                    placeholder="Apartment, suite, unit (optional)"
                                                    value={
                                                        data.shipping_address_line2
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'shipping_address_line2',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="city">
                                                    City / Town{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="city"
                                                    placeholder="Bromley, London"
                                                    value={data.shipping_city}
                                                    onChange={(e) =>
                                                        setData(
                                                            'shipping_city',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="expected_at"
                                        className="flex items-center gap-1.5"
                                    >
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <span>
                                            Expected{' '}
                                            {data.fulfillment_type ===
                                            'delivery'
                                                ? 'Delivery'
                                                : 'Collection'}{' '}
                                            Date & Time{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </span>
                                    </Label>
                                    <Input
                                        id="expected_at"
                                        type="datetime-local"
                                        value={data.expected_at}
                                        onChange={(e) =>
                                            setData(
                                                'expected_at',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Timezone: {checkoutTimezone}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 5. General Notes */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    5. Overall Order Notes
                                </CardTitle>
                                <CardDescription>
                                    Internal instructions or customer delivery
                                    notes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    rows={3}
                                    placeholder="Add any extra details, gate codes, or delivery notes here..."
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Order Summary & Dispatch Action */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="sticky top-6 space-y-6">
                            <Card className="border-2 border-primary/20 shadow-md">
                                <CardHeader className="bg-muted/20 pb-3">
                                    <CardTitle className="flex items-center justify-between text-lg font-bold">
                                        <span>Order Summary</span>
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-xs uppercase"
                                        >
                                            {data.order_source}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {/* Line items compact */}
                                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                        {data.items.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">
                                                No items added
                                            </p>
                                        ) : (
                                            data.items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between border-b border-muted py-1 text-xs"
                                                >
                                                    <span className="truncate pr-2">
                                                        {item.quantity}×{' '}
                                                        {item.product_name}
                                                        {item.variant_name &&
                                                            ` (${item.variant_name})`}
                                                    </span>
                                                    <span className="font-semibold whitespace-nowrap">
                                                        {formatCurrency(
                                                            item.unit_price *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Cost totals */}
                                    <div className="space-y-1.5 border-t pt-2 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Delivery</span>
                                            <span>
                                                {data.fulfillment_type ===
                                                'delivery'
                                                    ? formatCurrency(
                                                          data.shipping_amount,
                                                      )
                                                    : 'Free (Pickup)'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-base font-bold text-foreground">
                                            <span>Total to Charge</span>
                                            <span className="text-lg text-primary">
                                                {formatCurrency(total)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment link dispatch mode */}
                                    <div className="space-y-2 border-t pt-4">
                                        <Label className="text-xs font-semibold">
                                            Payment Link Sharing
                                        </Label>
                                        <div className="space-y-2">
                                            <label className="flex cursor-pointer items-center gap-2 rounded border bg-card p-2 text-xs hover:bg-accent/30">
                                                <input
                                                    type="radio"
                                                    name="send_link_via"
                                                    value="copy"
                                                    checked={
                                                        data.send_link_via ===
                                                        'copy'
                                                    }
                                                    onChange={() =>
                                                        setData(
                                                            'send_link_via',
                                                            'copy',
                                                        )
                                                    }
                                                    className="size-3.5 text-primary"
                                                />
                                                <div className="flex items-center gap-1.5">
                                                    <Copy className="size-3.5 text-muted-foreground" />
                                                    <span>
                                                        Copy link to send via
                                                        WhatsApp / SMS
                                                    </span>
                                                </div>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-2 rounded border bg-card p-2 text-xs hover:bg-accent/30">
                                                <input
                                                    type="radio"
                                                    name="send_link_via"
                                                    value="email"
                                                    checked={
                                                        data.send_link_via ===
                                                        'email'
                                                    }
                                                    onChange={() =>
                                                        setData(
                                                            'send_link_via',
                                                            'email',
                                                        )
                                                    }
                                                    className="size-3.5 text-primary"
                                                />
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="size-3.5 text-muted-foreground" />
                                                    <span>
                                                        Email link directly to
                                                        customer
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit action */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full gap-2 font-bold shadow-md"
                                        disabled={
                                            processing ||
                                            data.items.length === 0
                                        }
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Creating & Generating Link...
                                            </>
                                        ) : (
                                            <>Place Order & Get Link</>
                                        )}
                                    </Button>

                                    <p className="text-center text-[11px] text-muted-foreground">
                                        Order will remain{' '}
                                        <strong className="text-amber-600">
                                            unpaid
                                        </strong>{' '}
                                        until the customer completes Stripe
                                        checkout.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>

                {/* POST-SUBMIT SUCCESS MODAL: Direct Link Copy & WhatsApp Share */}
                {successOrder && (
                    <Dialog
                        open={true}
                        onOpenChange={() => setSuccessOrder(null)}
                    >
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl text-emerald-600">
                                    <Check className="size-5 rounded-full bg-emerald-100 p-0.5" />
                                    Order Created Successfully!
                                </DialogTitle>
                                <DialogDescription>
                                    Stripe Payment Link for Order #
                                    {successOrder.orderNumber} is ready to be
                                    shared with {successOrder.customerName}.
                                </DialogDescription>
                            </DialogHeader>

                            {successOrder.paymentLinkUrl && (
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2 rounded-md bg-muted p-3">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                            Payment Link URL
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                readOnly
                                                value={
                                                    successOrder.paymentLinkUrl
                                                }
                                                className="bg-background font-mono text-xs select-all"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleCopyPaymentLink(
                                                        successOrder.paymentLinkUrl!,
                                                    )
                                                }
                                                className="shrink-0 gap-1.5"
                                            >
                                                {copiedLink ? (
                                                    <Check className="size-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="size-3.5" />
                                                )}
                                                {copiedLink ? 'Copied' : 'Copy'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Direct WhatsApp Share Button */}
                                    {successOrder.customerPhone && (
                                        <a
                                            href={buildWhatsAppShareUrl(
                                                successOrder.customerPhone,
                                                successOrder.customerName,
                                                successOrder.orderNumber,
                                                successOrder.paymentLinkUrl,
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-emerald-700"
                                        >
                                            <MessageCircle className="size-4" />
                                            Send via WhatsApp to{' '}
                                            {successOrder.customerPhone}
                                        </a>
                                    )}
                                </div>
                            )}

                            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        (window.location.href = `/admin/store-orders/create`)
                                    }
                                >
                                    Create Another Order
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        (window.location.href = `/admin/orders`)
                                    }
                                >
                                    View All Orders
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
