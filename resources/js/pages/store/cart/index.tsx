import { Head, Link, router } from '@inertiajs/react';
import {
    Gift,
    Minus,
    PartyPopper,
    Plus,
    ShoppingBag,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

type CartItem = {
    line_key: string;
    product_id: string;
    variant_id: string | null;
    name: string;
    variant_name: string | null;
    product_type: string;
    preorder: boolean;
    price: string;
    quantity: number;
    product_line_total: string;
    add_on_total: string;
    line_total: string;
    image?: string | null;
    customization_text?: string | null;
    customization_font?: string | null;
    customization_primary_color?: {
        id: number;
        name: string;
        hex_code: string | null;
    } | null;
    customization_secondary_color?: {
        id: number;
        name: string;
        hex_code: string | null;
    } | null;
    is_customized: boolean;
    add_ons?: Array<{
        id: string;
        name: string;
        price: string;
        quantity: number;
        line_total: string;
    }>;
    kit_components?: Array<{
        id: string;
        quantity: string;
        component_name?: string | null;
        variant_name?: string | null;
    }>;
};

type CartData = {
    items: CartItem[];
    count: number;
    total: string;
};

type Props = {
    cart: CartData;
};

/**
 * Celebration-themed full cart page with purple/gold Party Eden palette.
 * Line items with confetti accents, quantity controls, color swatches,
 * and a grand-total panel with gradient + festive CTA.
 */
export default function CartPage({ cart }: Props) {
    const updateQuantity = (lineKey: string, newQty: number) => {
        if (newQty <= 0) {
            return;
        }

        router.patch(
            '/cart/update',
            {
                line_key: lineKey,
                quantity: newQty,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const removeItem = (lineKey: string) => {
        router.delete('/cart/remove', {
            data: {
                line_key: lineKey,
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Your Celebration Basket" />

            <div className="relative min-h-screen bg-popjoy-bg">
                {/* Festive floating confetti background */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-28 left-12 size-2.5 animate-float-slow rounded-full bg-popjoy-gold/70"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-40 right-20 size-1.5 animate-float-fast rounded-full bg-popjoy-purple/40"
                    style={{ animationDelay: '0.3s' }}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-96 right-40 size-2 animate-float rounded-full bg-popjoy-gold/60"
                    style={{ animationDelay: '0.8s' }}
                />

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Page hero header */}
                    <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-popjoy-purple via-[#7c3aed] to-[#630ed4] px-8 py-10 text-white shadow-[0_20px_50px_-20px_rgba(99,14,212,0.5)] sm:px-12 sm:py-12">
                        {/* Decorative accents */}
                        <span
                            aria-hidden
                            className="absolute top-8 left-16 size-2 animate-float rounded-full bg-popjoy-gold"
                        />
                        <span
                            aria-hidden
                            className="absolute top-6 right-24 size-1.5 animate-float-fast rounded-full bg-white/60"
                            style={{ animationDelay: '0.4s' }}
                        />
                        <span
                            aria-hidden
                            className="absolute bottom-8 left-28 size-1.5 animate-float-slow rounded-full bg-popjoy-gold/80"
                            style={{ animationDelay: '1s' }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-6 -right-8 animate-float-slow text-6xl opacity-20"
                        >
                            🎈
                        </div>
                        <div
                            aria-hidden
                            className="pointer-events-none absolute bottom-0 -left-4 animate-float text-5xl opacity-15"
                            style={{ animationDelay: '0.6s' }}
                        >
                            🎊
                        </div>

                        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-popjoy-gold shadow-[0_6px_16px_rgba(255,212,71,0.45)]">
                                    <Gift className="size-8 text-[#27103f]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl">
                                            Your Celebration Basket
                                        </h1>
                                        <Sparkles className="size-6 text-popjoy-gold" />
                                    </div>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-white/85">
                                        <ShoppingBag className="size-4" />
                                        {cart.count}{' '}
                                        {cart.count === 1 ? 'item' : 'items'}{' '}
                                        ready to make it float
                                        <PartyPopper className="size-4 text-popjoy-gold" />
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-full bg-white/15 px-5 py-2.5 backdrop-blur-sm">
                                <span className="text-xs font-semibold tracking-wider text-white/75 uppercase">
                                    Subtotal
                                </span>
                                <span className="font-plus-jakarta text-2xl font-extrabold tabular-nums">
                                    {formatCurrency(cart.total)}
                                </span>
                            </div>
                        </div>
                    </header>

                    {cart.items.length === 0 ? (
                        /* Empty basket state with celebration illustration */
                        <div className="mt-12 flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-popjoy-divider/70 bg-white px-6 py-20 text-center shadow-sm">
                            <div className="relative mb-8">
                                <div className="flex size-36 items-center justify-center rounded-full bg-gradient-to-br from-popjoy-purple-surface via-popjoy-purple-bg to-popjoy-gold-border/50 shadow-inner">
                                    <ShoppingBag className="size-18 text-popjoy-purple/50" />
                                </div>
                                <span
                                    aria-hidden
                                    className="absolute top-2 -right-4 animate-float-slow text-4xl"
                                >
                                    🎈
                                </span>
                                <span
                                    aria-hidden
                                    className="absolute bottom-2 -left-5 animate-float text-3xl"
                                    style={{ animationDelay: '0.5s' }}
                                >
                                    🎊
                                </span>
                                <span
                                    aria-hidden
                                    className="absolute right-4 -bottom-2 animate-float-fast text-2xl"
                                    style={{ animationDelay: '0.9s' }}
                                >
                                    ✨
                                </span>
                            </div>
                            <h2 className="font-plus-jakarta text-2xl font-bold text-popjoy-ink">
                                Basket is empty — let&apos;s party!
                            </h2>
                            <p className="mt-2 max-w-md text-sm text-popjoy-muted">
                                No balloons in your basket yet. Browse our
                                handcrafted collection and fill it with joy!
                            </p>
                            <Button
                                asChild
                                className="mt-8 h-12 rounded-full bg-gradient-to-r from-popjoy-purple to-[#7c3aed] px-8 text-sm font-bold shadow-[0_10px_28px_-8px_rgba(99,14,212,0.6)] transition-transform hover:scale-[1.02]"
                            >
                                <Link href="/products">
                                    <Sparkles className="size-4" />
                                    Browse Balloons
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-10 grid gap-8 lg:grid-cols-3">
                            {/* Cart items column */}
                            <div className="space-y-5 lg:col-span-2">
                                {cart.items.map((item) => (
                                    <article
                                        key={item.line_key}
                                        className="group relative overflow-hidden rounded-2xl border border-popjoy-divider/60 bg-white p-4 shadow-[0_3px_14px_-6px_rgba(99,14,212,0.12)] transition-all hover:border-popjoy-purple-surface hover:shadow-[0_8px_28px_-10px_rgba(99,14,212,0.2)] sm:p-5"
                                    >
                                        {/* Festive corner decorations */}
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute -top-4 -right-4 size-16 rounded-full bg-popjoy-purple-bg/70 opacity-60 transition-opacity group-hover:opacity-100"
                                        />
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute top-4 right-4 size-1.5 rounded-full bg-popjoy-gold opacity-0 transition-opacity group-hover:opacity-100"
                                        />

                                        <div className="relative flex flex-col gap-4 sm:flex-row sm:gap-5">
                                            {/* Product image with gold corner tag */}
                                            <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-popjoy-purple-bg via-white to-popjoy-gold-border/40 ring-2 ring-popjoy-purple-surface/70 sm:size-32">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="size-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <Gift className="size-10 text-popjoy-purple/50" />
                                                )}
                                                <span
                                                    aria-hidden
                                                    className="absolute top-0 left-0 h-2.5 w-2.5 rounded-br-md bg-popjoy-gold"
                                                />
                                            </div>

                                            {/* Details + controls */}
                                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate font-plus-jakarta text-base leading-tight font-bold text-popjoy-ink sm:text-lg">
                                                            {item.name}
                                                        </h3>
                                                        {item.variant_name && (
                                                            <p className="mt-0.5 text-sm text-popjoy-muted">
                                                                {
                                                                    item.variant_name
                                                                }
                                                            </p>
                                                        )}

                                                        {/* Type/state badges */}
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {item.product_type ===
                                                                'kit' && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-popjoy-purple/10 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-popjoy-purple uppercase">
                                                                    <Sparkles className="size-2.5" />
                                                                    Kit
                                                                </span>
                                                            )}
                                                            {item.is_customized && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-popjoy-gold/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-popjoy-gold-ink uppercase">
                                                                    ✏️
                                                                    Customised
                                                                </span>
                                                            )}
                                                            {item.preorder && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-800 uppercase">
                                                                    📦 Pre-order
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-2 text-sm font-semibold text-popjoy-muted">
                                                            {formatCurrency(
                                                                item.price,
                                                            )}{' '}
                                                            each
                                                        </p>

                                                        {/* Kit components included */}
                                                        {item.kit_components &&
                                                            item.kit_components
                                                                .length > 0 && (
                                                                <div className="mt-3 space-y-1 rounded-xl bg-popjoy-purple-bg/60 px-3 py-2.5">
                                                                    <p className="text-xs font-bold text-popjoy-ink">
                                                                        🎁
                                                                        What&apos;s
                                                                        included
                                                                    </p>
                                                                    {item.kit_components.map(
                                                                        (
                                                                            component,
                                                                        ) => (
                                                                            <p
                                                                                key={
                                                                                    component.id
                                                                                }
                                                                                className="text-xs text-popjoy-muted"
                                                                            >
                                                                                {
                                                                                    component.component_name
                                                                                }
                                                                                {component.variant_name &&
                                                                                    ` (${component.variant_name})`}{' '}
                                                                                ×
                                                                                {
                                                                                    component.quantity
                                                                                }
                                                                            </p>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}

                                                        {/* Color customisation with hex swatches */}
                                                        {(item.customization_primary_color ||
                                                            item.customization_secondary_color ||
                                                            item.customization_text ||
                                                            item.customization_font) && (
                                                            <div className="mt-3 space-y-1.5 rounded-xl bg-popjoy-gold-border/30 px-3 py-2.5">
                                                                {item.customization_primary_color && (
                                                                    <p className="flex items-center gap-2 text-xs text-popjoy-ink">
                                                                        <span
                                                                            className="size-3.5 rounded-full ring-1 ring-popjoy-divider"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    item
                                                                                        .customization_primary_color
                                                                                        .hex_code ??
                                                                                    '#eaddff',
                                                                            }}
                                                                        />
                                                                        <span className="font-semibold">
                                                                            Primary:
                                                                        </span>
                                                                        {
                                                                            item
                                                                                .customization_primary_color
                                                                                .name
                                                                        }
                                                                    </p>
                                                                )}
                                                                {item.customization_secondary_color && (
                                                                    <p className="flex items-center gap-2 text-xs text-popjoy-ink">
                                                                        <span
                                                                            className="size-3.5 rounded-full ring-1 ring-popjoy-divider"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    item
                                                                                        .customization_secondary_color
                                                                                        .hex_code ??
                                                                                    '#ffd447',
                                                                            }}
                                                                        />
                                                                        <span className="font-semibold">
                                                                            Secondary:
                                                                        </span>
                                                                        {
                                                                            item
                                                                                .customization_secondary_color
                                                                                .name
                                                                        }
                                                                    </p>
                                                                )}
                                                                {item.customization_text && (
                                                                    <p className="text-xs text-popjoy-ink">
                                                                        <span className="font-semibold">
                                                                            Message:{' '}
                                                                        </span>
                                                                        {item
                                                                            .customization_text
                                                                            .length >
                                                                        70
                                                                            ? `${item.customization_text.slice(
                                                                                  0,
                                                                                  70,
                                                                              )}…`
                                                                            : item.customization_text}
                                                                    </p>
                                                                )}
                                                                {item.customization_font && (
                                                                    <p className="text-xs text-popjoy-ink">
                                                                        <span className="font-semibold">
                                                                            Font:{' '}
                                                                        </span>
                                                                        {
                                                                            item.customization_font
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Add-ons */}
                                                        {item.add_ons &&
                                                            item.add_ons
                                                                .length > 0 && (
                                                                <div className="mt-3 space-y-1 rounded-xl bg-popjoy-purple-bg/40 px-3 py-2.5">
                                                                    <p className="text-xs font-bold text-popjoy-ink">
                                                                        ➕
                                                                        Add-ons
                                                                    </p>
                                                                    {item.add_ons.map(
                                                                        (
                                                                            addOn,
                                                                        ) => (
                                                                            <p
                                                                                key={
                                                                                    addOn.id
                                                                                }
                                                                                className="text-xs text-popjoy-muted"
                                                                            >
                                                                                {
                                                                                    addOn.name
                                                                                }{' '}
                                                                                ×
                                                                                {
                                                                                    addOn.quantity
                                                                                }{' '}
                                                                                —{' '}
                                                                                {formatCurrency(
                                                                                    addOn.line_total,
                                                                                )}
                                                                            </p>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.line_key,
                                                            )
                                                        }
                                                        title="Remove item"
                                                        className="size-9 rounded-full text-popjoy-muted transition-all hover:bg-[#bd3154]/10 hover:text-[#bd3154]"
                                                    >
                                                        <Trash2 className="size-4.5" />
                                                    </Button>
                                                </div>

                                                <div className="mt-auto flex items-end justify-between gap-3">
                                                    {/* Quantity stepper — purple/gold */}
                                                    <div className="inline-flex items-center gap-0.5 rounded-full border border-popjoy-divider bg-white p-0.5 shadow-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.line_key,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="flex size-8 items-center justify-center rounded-full text-popjoy-purple transition-colors hover:bg-popjoy-purple-bg sm:size-9"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="size-4" />
                                                        </button>
                                                        <span className="min-w-9 text-center font-plus-jakarta text-base font-bold text-popjoy-ink tabular-nums sm:min-w-10">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.line_key,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="flex size-8 items-center justify-center rounded-full bg-popjoy-purple text-white transition-colors hover:bg-[#7c3aed] sm:size-9"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="size-4" />
                                                        </button>
                                                    </div>

                                                    {/* Line total — gold price tag */}
                                                    <div className="text-right">
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-popjoy-gold to-[#ffd447] px-4 py-1.5 shadow-[0_4px_12px_rgba(255,212,71,0.45)]">
                                                            <span className="font-plus-jakarta text-base font-extrabold text-[#27103f] tabular-nums sm:text-lg">
                                                                {formatCurrency(
                                                                    item.line_total,
                                                                )}
                                                            </span>
                                                        </div>
                                                        {Number(
                                                            item.add_on_total,
                                                        ) > 0 && (
                                                            <p className="mt-1 text-xs text-popjoy-muted">
                                                                includes{' '}
                                                                {formatCurrency(
                                                                    item.add_on_total,
                                                                )}{' '}
                                                                add-ons
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Order summary sidebar */}
                            <aside className="h-fit space-y-5 lg:sticky lg:top-28">
                                <div className="relative overflow-hidden rounded-[2rem] border border-popjoy-divider/50 bg-white shadow-[0_10px_40px_-18px_rgba(99,14,212,0.25)]">
                                    {/* Decorative dots */}
                                    <span
                                        aria-hidden
                                        className="absolute top-5 left-6 size-1.5 rounded-full bg-popjoy-gold/80"
                                    />
                                    <span
                                        aria-hidden
                                        className="absolute top-8 right-10 size-1 rounded-full bg-popjoy-purple/40"
                                    />

                                    <div className="p-6 sm:p-7">
                                        <div className="flex items-center gap-2">
                                            <PartyPopper className="size-5 text-popjoy-purple" />
                                            <h2 className="font-plus-jakarta text-xl font-bold text-popjoy-ink">
                                                Order Summary
                                            </h2>
                                        </div>

                                        <div className="mt-5 space-y-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-popjoy-muted">
                                                    Subtotal ({cart.count}{' '}
                                                    items)
                                                </span>
                                                <span className="font-semibold text-popjoy-ink tabular-nums">
                                                    {formatCurrency(cart.total)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-popjoy-muted">
                                                    Delivery
                                                </span>
                                                <span className="font-semibold text-popjoy-purple">
                                                    Calculated at checkout
                                                </span>
                                            </div>
                                        </div>

                                        {/* Grand total banner */}
                                        <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-popjoy-purple via-[#7c3aed] to-popjoy-purple px-5 py-5 shadow-[0_10px_28px_-10px_rgba(99,14,212,0.6)]">
                                            <span
                                                aria-hidden
                                                className="absolute top-3 left-6 size-1.5 animate-float-fast rounded-full bg-popjoy-gold"
                                            />
                                            <span
                                                aria-hidden
                                                className="absolute right-10 bottom-3 size-2 animate-float-slow rounded-full bg-white/40"
                                                style={{
                                                    animationDelay: '0.5s',
                                                }}
                                            />
                                            <span
                                                aria-hidden
                                                className="absolute top-4 right-5 size-1 rounded-full bg-popjoy-gold/90"
                                            />
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="size-4 text-popjoy-gold" />
                                                    <span className="text-sm font-semibold text-white/90">
                                                        Grand Total
                                                    </span>
                                                </div>
                                                <span className="font-plus-jakarta text-3xl font-extrabold text-white tabular-nums">
                                                    {formatCurrency(cart.total)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-6 space-y-3">
                                            <Button
                                                asChild
                                                className="h-13 w-full rounded-full bg-gradient-to-r from-popjoy-gold to-[#ffd447] px-6 text-sm font-extrabold text-[#27103f] shadow-[0_10px_28px_-8px_rgba(255,212,71,0.7)] transition-transform hover:scale-[1.01] hover:shadow-[0_14px_34px_-8px_rgba(255,212,71,0.8)]"
                                            >
                                                <Link href="/checkout">
                                                    <Sparkles className="size-4.5" />
                                                    Secure Checkout
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-12 w-full rounded-full border-2 border-popjoy-divider bg-white text-sm font-bold text-popjoy-purple transition-colors hover:border-popjoy-purple/40 hover:bg-popjoy-purple-bg/60"
                                            >
                                                <Link href="/products">
                                                    Continue Shopping
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Trust badges */}
                                        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-popjoy-divider/50 pt-5 text-[10px]">
                                            <div className="flex flex-col items-center text-center text-popjoy-muted">
                                                <span className="text-lg">
                                                    🔒
                                                </span>
                                                <span className="mt-1 font-bold text-popjoy-ink">
                                                    Secure
                                                </span>
                                                <span>SSL payments</span>
                                            </div>
                                            <div className="flex flex-col items-center text-center text-popjoy-muted">
                                                <span className="text-lg">
                                                    🚚
                                                </span>
                                                <span className="mt-1 font-bold text-popjoy-ink">
                                                    Tracked
                                                </span>
                                                <span>Hand delivery</span>
                                            </div>
                                            <div className="flex flex-col items-center text-center text-popjoy-muted">
                                                <span className="text-lg">
                                                    💝
                                                </span>
                                                <span className="mt-1 font-bold text-popjoy-ink">
                                                    Loved
                                                </span>
                                                <span>5★ reviews</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
