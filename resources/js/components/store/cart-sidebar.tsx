import { Link, router } from '@inertiajs/react';
import {
    Gift,
    Minus,
    PartyPopper,
    Plus,
    ShoppingBag,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

type CartItem = {
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
};

type CartData = {
    items: CartItem[];
    count: number;
    total: string;
};

type Props = {
    cart: CartData;
    open: boolean;
    onClose: () => void;
};

/**
 * Celebration-themed slide-out basket drawer.
 * Features Party Eden purple/gold palette, confetti accents,
 * floating balloons, and live item count badge.
 */
export function CartSidebar({ cart, open, onClose }: Props) {
    const updateQuantity = useCallback((lineKey: string, newQty: number) => {
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
    }, []);

    const removeItem = useCallback((lineKey: string) => {
        router.delete('/cart/remove', {
            data: {
                line_key: lineKey,
            },
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    if (!open) {
        return null;
    }

    return (
        <>
            {/* Backdrop with subtle purple tint */}
            <div
                className="fixed inset-0 z-50 bg-[#27103f]/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Celebration Basket Drawer Panel */}
            <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden bg-[#fef7ff] shadow-[0_0_60px_rgba(99,14,212,0.2)]">
                {/* Festive header with gradient + decorative elements */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#630ed4] via-[#7c3aed] to-[#630ed4] px-5 pt-5 pb-6 text-white">
                    {/* Decorative floating confetti dots */}
                    <span className="absolute top-10 left-8 size-2 animate-float-slow rounded-full bg-[#ffd447]" />
                    <span
                        className="absolute top-6 right-16 size-1.5 animate-float-fast rounded-full bg-white/70"
                        style={{ animationDelay: '0.3s' }}
                    />
                    <span
                        className="absolute top-14 right-32 size-2.5 animate-float rounded-full bg-[#fdc425]"
                        style={{ animationDelay: '0.7s' }}
                    />
                    <span
                        className="absolute top-20 left-20 size-1 animate-float rounded-full bg-[#eaddff]"
                        style={{ animationDelay: '1s' }}
                    />
                    <span className="absolute right-10 bottom-4 size-3 animate-float-slow rounded-full bg-[#ffdf57]/80" />
                    <span className="absolute bottom-6 left-12 size-1.5 animate-float-fast rounded-full bg-white/50" />

                    {/* Balloon accent decorations */}
                    <div
                        className="pointer-events-none absolute -top-4 -right-6 animate-float-slow text-5xl opacity-20"
                        aria-hidden
                    >
                        🎈
                    </div>
                    <div
                        className="pointer-events-none absolute bottom-0 -left-4 animate-float text-4xl opacity-15"
                        style={{ animationDelay: '0.5s' }}
                        aria-hidden
                    >
                        🎉
                    </div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Celebration gift bag icon */}
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ffd447] shadow-[0_4px_12px_rgba(255,212,71,0.4)]">
                                <Gift className="size-5 text-[#27103f]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h2 className="font-plus-jakarta text-lg leading-tight font-bold">
                                        Celebration Basket
                                    </h2>
                                    <Sparkles className="size-4 text-[#ffd447]" />
                                </div>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/80">
                                    <ShoppingBag className="size-3" />
                                    {cart.count}{' '}
                                    {cart.count === 1 ? 'item' : 'items'} ready
                                    to party
                                </p>
                            </div>
                        </div>
                        {/* Close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="size-9 rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                        >
                            <X className="size-5" />
                        </Button>
                    </div>

                    {/* Gold count pill */}
                    {cart.count > 0 && (
                        <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-[#ffd447] px-3.5 py-1.5 shadow-[0_4px_12px_rgba(255,212,71,0.35)]">
                            <PartyPopper className="size-3.5 text-[#27103f]" />
                            <span className="text-xs font-extrabold tracking-wide text-[#27103f]">
                                {formatCurrency(cart.total)} total
                            </span>
                        </div>
                    )}
                </div>

                {/* Divider with scalloped edge using gold */}
                <div className="relative h-3 bg-gradient-to-b from-[#630ed4] to-[#fef7ff]">
                    <svg
                        className="absolute -bottom-0.5 left-0 w-full"
                        viewBox="0 0 1200 12"
                        preserveAspectRatio="none"
                        aria-hidden
                    >
                        <path
                            d="M0,12 Q50,0 100,12 T200,12 T300,12 T400,12 T500,12 T600,12 T700,12 T800,12 T900,12 T1000,12 T1100,12 T1200,12 L1200,12 L0,12 Z"
                            fill="#fef7ff"
                        />
                    </svg>
                </div>

                {/* Items list / summary / empty state */}
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    {cart.items.length > 0 ? (
                        // Full line-items view — available on cart/checkout routes that
                        // populate shared `cart.items`
                        <ul className="space-y-4">
                            {cart.items.map((item) => (
                                <li
                                    key={item.line_key}
                                    className="group relative overflow-hidden rounded-2xl border border-[#eadff0] bg-white p-3.5 shadow-[0_2px_8px_rgba(99,14,212,0.05)] transition-all hover:border-[#eaddff] hover:shadow-[0_6px_18px_rgba(99,14,212,0.1)]"
                                >
                                    {/* Subtle purple corner accent */}
                                    <span className="pointer-events-none absolute -top-3 -right-3 size-10 rounded-full bg-[#f9f1ff] opacity-60 transition-opacity group-hover:opacity-100" />
                                    <span className="pointer-events-none absolute top-3 right-3 size-1.5 rounded-full bg-[#ffd447] opacity-0 transition-opacity group-hover:opacity-100" />

                                    <div className="relative flex gap-3.5">
                                        {/* Product image with celebration border */}
                                        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f9f1ff] to-[#fff4df] ring-2 ring-[#eaddff]/70">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="size-full object-contain p-1"
                                                />
                                            ) : (
                                                <Gift className="size-7 text-[#7c3aed]/50" />
                                            )}
                                            {/* Gold corner tag */}
                                            <span className="absolute top-0 left-0 h-2 w-2 rounded-br-md bg-[#ffd447]" />
                                        </div>

                                        {/* Info + controls */}
                                        <div className="flex flex-1 flex-col gap-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-plus-jakarta text-sm leading-tight font-bold text-[#201637]">
                                                        {item.name}
                                                    </p>
                                                    {item.variant_name && (
                                                        <p className="mt-0.5 text-xs text-[#4a4455]">
                                                            {item.variant_name}
                                                        </p>
                                                    )}
                                                    {/* Color customization indicators */}
                                                    {(item.customization_primary_color ||
                                                        item.customization_secondary_color) && (
                                                        <div className="mt-1.5 flex items-center gap-1.5">
                                                            {item.customization_primary_color && (
                                                                <div
                                                                    className="flex items-center gap-1 rounded-full bg-[#f9f1ff] px-2 py-0.5"
                                                                    title={`Primary: ${item.customization_primary_color.name}`}
                                                                >
                                                                    <span
                                                                        className="size-2.5 rounded-full ring-1 ring-[#eadff0]"
                                                                        style={{
                                                                            backgroundColor:
                                                                                item
                                                                                    .customization_primary_color
                                                                                    .hex_code ??
                                                                                '#eaddff',
                                                                        }}
                                                                    />
                                                                    <span className="text-[10px] font-semibold text-[#4a4455]">
                                                                        {
                                                                            item
                                                                                .customization_primary_color
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {item.customization_secondary_color && (
                                                                <div
                                                                    className="flex items-center gap-1 rounded-full bg-[#fff4df] px-2 py-0.5"
                                                                    title={`Secondary: ${item.customization_secondary_color.name}`}
                                                                >
                                                                    <span
                                                                        className="size-2.5 rounded-full ring-1 ring-[#ffdf9a]"
                                                                        style={{
                                                                            backgroundColor:
                                                                                item
                                                                                    .customization_secondary_color
                                                                                    .hex_code ??
                                                                                '#ffd447',
                                                                        }}
                                                                    />
                                                                    <span className="text-[10px] font-semibold text-[#6d5200]">
                                                                        {
                                                                            item
                                                                                .customization_secondary_color
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {item.customization_text && (
                                                        <p className="mt-1 truncate rounded-md bg-[#f9f1ff] px-2 py-0.5 text-[10px] text-[#4a4455]">
                                                            ✏️{' '}
                                                            {
                                                                item.customization_text
                                                            }
                                                        </p>
                                                    )}
                                                    {item.add_ons &&
                                                        item.add_ons.length >
                                                            0 && (
                                                            <p className="mt-1 text-[10px] text-[#7b7487]">
                                                                +
                                                                {item.add_ons
                                                                    .map(
                                                                        (a) =>
                                                                            a.name,
                                                                    )
                                                                    .join(', ')}
                                                            </p>
                                                        )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 shrink-0 rounded-full text-[#7b7487] transition-all hover:bg-[#630ed4]/10 hover:text-[#bd3154]"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.line_key,
                                                        )
                                                    }
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                {/* Quantity stepper styled with purple/gold */}
                                                <div className="inline-flex items-center gap-0.5 rounded-full border border-[#eadff0] bg-white p-0.5 shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.line_key,
                                                                item.quantity -
                                                                    1,
                                                            )
                                                        }
                                                        className="flex size-7 items-center justify-center rounded-full text-[#630ed4] transition-colors hover:bg-[#f9f1ff]"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="size-3.5" />
                                                    </button>
                                                    <span className="min-w-7 text-center font-plus-jakarta text-sm font-bold text-[#201637] tabular-nums">
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
                                                        className="flex size-7 items-center justify-center rounded-full bg-[#630ed4] text-white transition-all hover:bg-[#7c3aed]"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="size-3.5" />
                                                    </button>
                                                </div>

                                                {/* Line total with gold price tag */}
                                                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fdc425] to-[#ffd447] px-3 py-1 shadow-[0_2px_6px_rgba(255,212,71,0.4)]">
                                                    <span className="font-plus-jakarta text-sm font-extrabold text-[#27103f] tabular-nums">
                                                        {formatCurrency(
                                                            Number(item.price) *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : cart.count > 0 ? (
                        // Partial summary view — shared Inertia `cart.count` and `cart.total`
                        // exist on every route, but `cart.items[]` is only populated on
                        // cart/checkout routes. Direct the user to the full basket page
                        // to see line items & customizations.
                        <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                            <div className="relative mb-5">
                                <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#eaddff] to-[#fff4df] shadow-inner">
                                    <ShoppingBag className="size-12 text-[#7c3aed]/60" />
                                </div>
                                <span className="absolute top-1 -right-1 animate-float-slow text-2xl">
                                    🎈
                                </span>
                                <span
                                    className="absolute bottom-1 -left-2 animate-float text-xl"
                                    style={{ animationDelay: '0.4s' }}
                                >
                                    ✨
                                </span>
                            </div>
                            <h3 className="font-plus-jakarta text-lg font-bold text-[#201637]">
                                Your celebration order is waiting
                            </h3>
                            <p className="mt-2 max-w-xs text-sm text-[#4a4455]">
                                {cart.count === 1 ? (
                                    <>1 item is all set for your party.</>
                                ) : (
                                    <>
                                        {cart.count} items are all set for your
                                        party.
                                    </>
                                )}{' '}
                                Open the full basket to review line items,
                                adjust quantities, or continue to checkout.
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ffd447] to-[#fdc425] px-4 py-2 shadow-[0_4px_14px_rgba(255,212,71,0.45)]">
                                <PartyPopper className="size-4 text-[#27103f]" />
                                <span className="text-sm font-extrabold text-[#27103f] tabular-nums">
                                    {formatCurrency(cart.total)} total
                                </span>
                            </div>
                            <div className="mt-6 flex w-full flex-col gap-2.5">
                                <Button
                                    asChild
                                    onClick={onClose}
                                    className="h-11 w-full rounded-full bg-gradient-to-r from-[#ffd447] to-[#fdc425] text-sm font-extrabold text-[#27103f] shadow-[0_6px_16px_rgba(255,212,71,0.5)] transition-transform hover:scale-[1.01]"
                                >
                                    <Link href="/checkout">
                                        <Sparkles className="size-4" />
                                        Checkout &amp; Pay
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    onClick={onClose}
                                    variant="outline"
                                    className="h-11 w-full rounded-full border-2 border-[#eadff0] bg-white text-sm font-bold text-[#630ed4] transition-colors hover:border-[#d7c5ef] hover:bg-[#f9f1ff]"
                                >
                                    <Link href="/cart">View Full Basket</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Truly empty basket — zero items and no known count
                        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                            {/* Empty basket celebration illustration */}
                            <div className="relative mb-6">
                                <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-[#eaddff] to-[#f9f1ff] shadow-inner">
                                    <ShoppingBag className="size-14 text-[#7c3aed]/50" />
                                </div>
                                <span className="absolute top-2 -right-2 animate-float-slow text-3xl">
                                    🎈
                                </span>
                                <span
                                    className="absolute bottom-1 -left-3 animate-float text-2xl"
                                    style={{ animationDelay: '0.4s' }}
                                >
                                    🎊
                                </span>
                            </div>
                            <h3 className="font-plus-jakarta text-xl font-bold text-[#201637]">
                                Basket is empty!
                            </h3>
                            <p className="mt-2 max-w-xs text-sm text-[#4a4455]">
                                Time to start the celebration — browse our
                                balloons &amp; party goodies!
                            </p>
                            <Button
                                asChild
                                onClick={onClose}
                                className="mt-6 h-11 rounded-full bg-gradient-to-r from-[#630ed4] to-[#7c3aed] px-7 text-sm font-bold text-white shadow-[0_8px_20px_rgba(99,14,212,0.35)] transition-transform hover:scale-[1.02]"
                            >
                                <Link href="/products">
                                    <Sparkles className="size-4" />
                                    Start Shopping
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer with totals and checkout CTA — only when we have a
                    real line-items list to summarize */}
                {cart.items.length > 0 && (
                    <div className="relative overflow-hidden border-t border-[#eadff0] bg-gradient-to-b from-white to-[#f9f1ff]/60 px-5 py-5">
                        {/* Decorative dots */}
                        <span className="absolute top-4 left-8 size-1.5 rounded-full bg-[#ffd447]/70" />
                        <span className="absolute top-6 right-14 size-1 rounded-full bg-[#7c3aed]/40" />

                        {/* Subtotal breakdown */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-[#4a4455]">Subtotal</span>
                                <span className="font-medium text-[#201637] tabular-nums">
                                    {formatCurrency(cart.total)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#7b7487]">
                                    Delivery &amp; extras
                                </span>
                                <span className="text-[#7b7487]">
                                    Calculated at checkout
                                </span>
                            </div>
                        </div>

                        {/* Grand total banner */}
                        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#630ed4] via-[#7c3aed] to-[#630ed4] px-5 py-4 shadow-[0_8px_24px_rgba(99,14,212,0.3)]">
                            <span className="absolute top-2 left-6 size-1.5 animate-float-fast rounded-full bg-[#ffd447]" />
                            <span
                                className="absolute right-10 bottom-2 size-2 animate-float-slow rounded-full bg-white/40"
                                style={{ animationDelay: '0.4s' }}
                            />
                            <span className="absolute top-3 right-4 size-1 rounded-full bg-[#fdc425]/80" />

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <PartyPopper className="size-4 text-[#ffd447]" />
                                    <span className="text-sm font-semibold text-white/90">
                                        Grand Total
                                    </span>
                                </div>
                                <span className="font-plus-jakarta text-2xl font-extrabold text-white tabular-nums">
                                    {formatCurrency(cart.total)}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex flex-col gap-2.5">
                            <Button
                                asChild
                                onClick={onClose}
                                className="h-12 w-full rounded-full bg-gradient-to-r from-[#ffd447] to-[#fdc425] text-sm font-extrabold text-[#27103f] shadow-[0_6px_16px_rgba(255,212,71,0.5)] transition-transform hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(255,212,71,0.6)]"
                            >
                                <Link href="/checkout">
                                    <Sparkles className="size-4" />
                                    Checkout &amp; Pay
                                </Link>
                            </Button>
                            <Button
                                asChild
                                onClick={onClose}
                                variant="outline"
                                className="h-11 w-full rounded-full border-2 border-[#eadff0] bg-white text-sm font-bold text-[#630ed4] transition-colors hover:border-[#d7c5ef] hover:bg-[#f9f1ff]"
                            >
                                <Link href="/cart">View Full Basket</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
