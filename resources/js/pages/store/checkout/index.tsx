import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CardElement,
    Elements,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
    CreditCard,
    Gift,
    Lock,
    MapPin,
    PartyPopper,
    Sparkles,
    Truck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/currency';

const normalizePostcode = (postcode: string) =>
    postcode.replace(/\s+/g, '').toUpperCase().trim();

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
    add_ons?: Array<{
        id: string;
        name: string;
        quantity: number;
        line_total: string;
    }>;
};

type CartData = {
    items: CartItem[];
    count: number;
    total: string;
    turnover_time_hours: string;
};

type LoyaltySettings = {
    points_per_currency_unit: string;
    currency_value_per_point: string;
    is_active: boolean;
};

type LoyaltyAccount = {
    id: string;
    points_balance: string;
    total_points_earned: string;
    total_points_redeemed: string;
};

type DeliveryZoneMatch = {
    id: number;
    name: string;
    delivery_price: string;
    min_order_amount: string | null;
};

type Props = {
    cart: CartData;
    customer?: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string | null;
    } | null;
    loyaltySettings: LoyaltySettings;
    minimumExpectedAt: string;
    minimumDeliveryAt: string;
    maximumTurnoverTimeHours: number;
};

type PaymentStep = 'details' | 'payment' | 'processing';

/**
 * Celebration-themed checkout page with purple/gold Party Eden palette.
 * Sections: customer info, fulfillment (pickup/delivery with postcode lookup),
 * loyalty redemption, Stripe card payment via Elements, and a sticky
 * celebration order summary sidebar.
 */
export default function CheckoutPage({
    cart,
    customer,
    loyaltySettings,
    minimumExpectedAt,
    minimumDeliveryAt,
    maximumTurnoverTimeHours,
}: Props) {
    const { props: pageProps } = usePage<{
        stripePublicKey?: string;
    }>();
    const stripePublicKey = (pageProps.stripePublicKey as string) ?? '';
    const stripePromise = useMemo(
        () => (stripePublicKey.length > 0 ? loadStripe(stripePublicKey) : null),
        [stripePublicKey],
    );

    const [paymentStep, setPaymentStep] = useState<PaymentStep>('details');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(
        null,
    );
    const [loyaltyLookupLoading, setLoyaltyLookupLoading] = useState(false);
    const [matchedDeliveryZone, setMatchedDeliveryZone] =
        useState<DeliveryZoneMatch | null>(null);
    const [deliveryZoneLookupLoading, setDeliveryZoneLookupLoading] =
        useState(false);
    const [deliveryZoneMessage, setDeliveryZoneMessage] = useState<
        string | null
    >(null);

    const { data, setData, errors } = useForm({
        first_name: customer?.first_name ?? '',
        last_name: customer?.last_name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        notes: '',
        fulfillment_type: 'pickup',
        expected_at: '',
        delivery_postcode: '',
        address_line1: '',
        address_line2: '',
        city: '',
        loyalty_points: '',
    });

    const normalizedDeliveryPostcode = normalizePostcode(
        data.delivery_postcode,
    );
    const canLookupDeliveryZone =
        data.fulfillment_type === 'delivery' &&
        normalizedDeliveryPostcode.length >= 4;

    const deliveryPrice = matchedDeliveryZone
        ? Number(matchedDeliveryZone.delivery_price)
        : 0;
    const subtotal = Number(cart.total);
    const totalBeforeDiscount = subtotal + deliveryPrice;
    const belowMinimum =
        matchedDeliveryZone?.min_order_amount !== null &&
        matchedDeliveryZone?.min_order_amount !== undefined &&
        subtotal < Number(matchedDeliveryZone.min_order_amount);

    const resetDeliveryZoneState = () => {
        setMatchedDeliveryZone(null);
        setDeliveryZoneLookupLoading(false);
        setDeliveryZoneMessage(null);
    };

    const handleFulfillmentChange = (value: string) => {
        resetDeliveryZoneState();
        setData('fulfillment_type', value);
    };

    const handleDeliveryPostcodeChange = (value: string) => {
        setData('delivery_postcode', value);
        resetDeliveryZoneState();
    };

    const handleEmailChange = (value: string) => {
        setLoyaltyAccount(null);
        setLoyaltyLookupLoading(false);
        setData('loyalty_points', '');
        setData('email', value);
    };

    // Delivery zone live lookup
    useEffect(() => {
        if (data.fulfillment_type !== 'delivery' || !canLookupDeliveryZone) {
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setDeliveryZoneLookupLoading(true);

            try {
                const response = await fetch(
                    `/checkout/delivery-zone?postcode=${encodeURIComponent(data.delivery_postcode)}`,
                    {
                        signal: controller.signal,
                    },
                );

                const result = (await response.json()) as {
                    zone?: DeliveryZoneMatch | null;
                    message?: string | null;
                };

                if (!response.ok || !result.zone) {
                    setMatchedDeliveryZone(null);
                    setDeliveryZoneMessage(
                        result.message ?? 'Outside delivery zone.',
                    );

                    return;
                }

                setMatchedDeliveryZone(result.zone);
                setDeliveryZoneMessage(null);
            } catch {
                if (!controller.signal.aborted) {
                    setMatchedDeliveryZone(null);
                    setDeliveryZoneMessage(
                        'Could not verify your delivery zone right now.',
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setDeliveryZoneLookupLoading(false);
                }
            }
        }, 300);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [canLookupDeliveryZone, data.delivery_postcode, data.fulfillment_type]);

    // Loyalty calculations
    const pointsValue = Number(loyaltySettings.currency_value_per_point || 0);
    const pointsPerCurrencyUnit = Number(
        loyaltySettings.points_per_currency_unit || 0,
    );
    const availablePoints = Number(loyaltyAccount?.points_balance ?? 0);
    const maxRedeemablePoints =
        pointsValue > 0
            ? Math.min(availablePoints, totalBeforeDiscount / pointsValue)
            : 0;
    const requestedPoints = Number(data.loyalty_points || 0);
    const appliedLoyaltyPoints = Math.min(
        Math.max(requestedPoints, 0),
        maxRedeemablePoints,
    );
    const loyaltyDiscount =
        pointsValue > 0 ? appliedLoyaltyPoints * pointsValue : 0;
    const grandTotal = Math.max(totalBeforeDiscount - loyaltyDiscount, 0);
    const estimatedEarnPoints = Math.max(
        (subtotal - loyaltyDiscount) * pointsPerCurrencyUnit,
        0,
    );

    // Loyalty account live lookup
    useEffect(() => {
        if (!loyaltySettings.is_active) {
            return;
        }

        const trimmedEmail = data.email.trim();
        const emailLooksValid = /\S+@\S+\.\S+/.test(trimmedEmail);

        if (!emailLooksValid) {
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoyaltyLookupLoading(true);

            try {
                const response = await fetch(
                    `/checkout/loyalty-account?email=${encodeURIComponent(trimmedEmail)}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    setLoyaltyAccount(null);
                    setData('loyalty_points', '');

                    return;
                }

                const result = (await response.json()) as {
                    account: LoyaltyAccount | null;
                };

                setLoyaltyAccount(result.account);

                if (!result.account) {
                    setData('loyalty_points', '');
                }
            } catch {
                if (!controller.signal.aborted) {
                    setLoyaltyAccount(null);
                    setData('loyalty_points', '');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoyaltyLookupLoading(false);
                }
            }
        }, 300);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [data.email, loyaltySettings.is_active, setData]);

    // Step 1 → 2: validate details then create Stripe PaymentIntent
    const handleContinueToPayment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !data.first_name.trim() ||
            !data.last_name.trim() ||
            !data.email.trim()
        ) {
            toast.error('Please fill in all required fields.');

            return;
        }

        if (
            data.fulfillment_type === 'delivery' &&
            !data.delivery_postcode.trim()
        ) {
            toast.error('Please enter a delivery postcode.');

            return;
        }

        if (
            data.fulfillment_type === 'delivery' &&
            (!data.address_line1.trim() || !data.city.trim())
        ) {
            toast.error('Please enter your delivery address and city.');

            return;
        }

        const selectedTime = data.expected_at.split('T')[1] ?? '';
        const minimumForFulfillment =
            data.fulfillment_type === 'delivery'
                ? minimumDeliveryAt
                : minimumExpectedAt;

        if (!data.expected_at || data.expected_at < minimumForFulfillment) {
            toast.error(
                'Please choose a later delivery or collection date and time.',
            );

            return;
        }

        if (data.fulfillment_type === 'delivery' && selectedTime < '15:00') {
            toast.error('Delivery is available from 3:00 PM onwards.');

            return;
        }

        if (data.fulfillment_type === 'delivery' && deliveryZoneLookupLoading) {
            toast.error('Checking your delivery zone. Please wait a moment.');

            return;
        }

        if (data.fulfillment_type === 'delivery' && !matchedDeliveryZone) {
            toast.error(deliveryZoneMessage ?? 'Outside delivery zone.');

            return;
        }

        if (data.fulfillment_type === 'delivery' && belowMinimum) {
            toast.error(
                'Your order is below the minimum for this delivery zone.',
            );

            return;
        }

        setPaymentStep('processing');
        setPaymentError(null);

        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';

            const response = await fetch('/payment/stripe-intent', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    email: data.email,
                    fulfillment_type: data.fulfillment_type,
                    expected_at: data.expected_at,
                    delivery_postcode: data.delivery_postcode,
                    loyalty_points: appliedLoyaltyPoints,
                }),
            });

            let result: {
                error?: string;
                message?: string;
                client_secret?: string;
                errors?: Record<string, string[]>;
            } = {};

            try {
                result = (await response.json()) as typeof result;
            } catch {
                setPaymentError(
                    'Server returned an invalid response. Please retry.',
                );
                setPaymentStep('details');

                return;
            }

            if (!response.ok || !result.client_secret) {
                const firstValidation = Object.values(
                    result.errors ?? {},
                )[0]?.[0];
                setPaymentError(
                    result.error ??
                        firstValidation ??
                        result.message ??
                        'Could not start payment.',
                );
                setPaymentStep('details');

                return;
            }

            setClientSecret(result.client_secret);
            setPaymentStep('payment');
        } catch (err) {
            const fallback =
                err instanceof Error && err.message
                    ? err.message
                    : 'Network error. Please try again.';
            setPaymentError(fallback);
            setPaymentStep('details');
        }
    };

    const handleBackToDetails = () => {
        setPaymentStep('details');
        setClientSecret(null);
        setPaymentError(null);
    };

    return (
        <>
            <Head title="Checkout" />

            <div className="relative min-h-screen bg-popjoy-bg">
                {/* Background celebration confetti */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-24 left-12 size-2.5 animate-float-slow rounded-full bg-popjoy-gold/60"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-40 right-16 size-1.5 animate-float-fast rounded-full bg-popjoy-purple/35"
                    style={{ animationDelay: '0.25s' }}
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-[28rem] right-32 size-2 animate-float rounded-full bg-popjoy-gold/50"
                    style={{ animationDelay: '0.7s' }}
                />

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Page header — celebration gradient banner */}
                    <header className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-popjoy-purple via-[#7c3aed] to-[#630ed4] px-8 py-9 text-white shadow-[0_20px_50px_-22px_rgba(99,14,212,0.55)] sm:px-12 sm:py-11">
                        {/* Decorative accents */}
                        <span
                            aria-hidden
                            className="absolute top-6 left-20 size-2 animate-float rounded-full bg-popjoy-gold"
                        />
                        <span
                            aria-hidden
                            className="absolute top-8 right-28 size-1.5 animate-float-fast rounded-full bg-white/60"
                            style={{ animationDelay: '0.4s' }}
                        />
                        <span
                            aria-hidden
                            className="absolute bottom-6 left-32 size-1.5 animate-float-slow rounded-full bg-popjoy-gold/80"
                            style={{ animationDelay: '1s' }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-8 -right-10 animate-float-slow text-7xl opacity-20"
                        >
                            🎈
                        </div>
                        <div
                            aria-hidden
                            className="pointer-events-none absolute bottom-2 -left-6 animate-float text-5xl opacity-15"
                            style={{ animationDelay: '0.6s' }}
                        >
                            🎊
                        </div>

                        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-popjoy-gold shadow-[0_6px_18px_rgba(255,212,71,0.45)]">
                                    <Lock className="size-7 text-[#27103f]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl">
                                            Secure Checkout
                                        </h1>
                                        <Sparkles className="size-6 text-popjoy-gold" />
                                    </div>
                                    <p className="mt-1 text-sm text-white/85">
                                        Your celebration order — safe &amp;
                                        secure
                                        <PartyPopper className="ml-2 inline size-4 text-popjoy-gold" />
                                    </p>
                                </div>
                            </div>

                            {/* Steps indicator */}
                            <ol className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 backdrop-blur-sm sm:gap-3">
                                <li
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                        paymentStep === 'details'
                                            ? 'bg-popjoy-gold text-[#27103f]'
                                            : 'text-white/90'
                                    }`}
                                >
                                    <span className="font-plus-jakarta text-sm">
                                        1
                                    </span>
                                    Details
                                </li>
                                <span
                                    className="text-xs text-white/40"
                                    aria-hidden
                                >
                                    →
                                </span>
                                <li
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                        paymentStep === 'payment' ||
                                        paymentStep === 'processing'
                                            ? 'bg-popjoy-gold text-[#27103f]'
                                            : 'text-white/50'
                                    }`}
                                >
                                    <span className="font-plus-jakarta text-sm">
                                        2
                                    </span>
                                    Pay
                                </li>
                            </ol>
                        </div>
                    </header>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left column — forms */}
                        <div className="space-y-6 lg:col-span-2">
                            {paymentStep === 'details' && (
                                <form
                                    onSubmit={handleContinueToPayment}
                                    className="space-y-6"
                                >
                                    {/* Customer information */}
                                    <section className="relative overflow-hidden rounded-[1.5rem] border border-popjoy-divider/50 bg-white p-6 shadow-[0_6px_24px_-14px_rgba(99,14,212,0.2)] sm:p-7">
                                        <span
                                            aria-hidden
                                            className="absolute top-5 right-6 size-1.5 rounded-full bg-popjoy-gold"
                                        />
                                        <div className="mb-5 flex items-center gap-2.5">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-popjoy-purple/10">
                                                <span className="font-plus-jakarta text-base font-extrabold text-popjoy-purple">
                                                    1
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                                    Your details
                                                </h2>
                                                <p className="text-xs text-popjoy-muted">
                                                    Where we&apos;ll send order
                                                    updates
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="first_name"
                                                    className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                >
                                                    First Name *
                                                </Label>
                                                <Input
                                                    id="first_name"
                                                    className="h-11 rounded-xl border-popjoy-divider/80 bg-popjoy-bg/40 focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                    value={data.first_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'first_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.first_name}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="last_name"
                                                    className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                >
                                                    Last Name *
                                                </Label>
                                                <Input
                                                    id="last_name"
                                                    className="h-11 rounded-xl border-popjoy-divider/80 bg-popjoy-bg/40 focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                    value={data.last_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'last_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.last_name}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                >
                                                    Email *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="h-11 rounded-xl border-popjoy-divider/80 bg-popjoy-bg/40 focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        handleEmailChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="phone"
                                                    className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                >
                                                    Phone
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    className="h-11 rounded-xl border-popjoy-divider/80 bg-popjoy-bg/40 focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <Label
                                                htmlFor="notes"
                                                className="text-xs font-bold tracking-wide text-popjoy-ink"
                                            >
                                                Order notes (optional)
                                            </Label>
                                            <textarea
                                                id="notes"
                                                className="min-h-20 w-full rounded-xl border border-popjoy-divider/80 bg-popjoy-bg/40 px-3.5 py-2.5 text-sm focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20 focus:outline-none"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        'notes',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Any special requirements for your celebration?"
                                            />
                                        </div>
                                    </section>

                                    {/* Fulfillment selection */}
                                    <section className="relative overflow-hidden rounded-[1.5rem] border border-popjoy-divider/50 bg-white p-6 shadow-[0_6px_24px_-14px_rgba(99,14,212,0.2)] sm:p-7">
                                        <span
                                            aria-hidden
                                            className="absolute top-5 left-7 size-1.5 rounded-full bg-popjoy-purple/60"
                                        />
                                        <div className="mb-5 flex items-center gap-2.5">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-popjoy-purple/10">
                                                <span className="font-plus-jakarta text-base font-extrabold text-popjoy-purple">
                                                    2
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                                    How would you like to
                                                    receive your order?
                                                </h2>
                                                <p className="text-xs text-popjoy-muted">
                                                    Choose collection or
                                                    hand-delivered balloons
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <label
                                                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                                                    data.fulfillment_type ===
                                                    'pickup'
                                                        ? 'border-popjoy-purple bg-popjoy-purple-bg/50 shadow-[0_4px_18px_-10px_rgba(99,14,212,0.4)]'
                                                        : 'border-popjoy-divider/60 bg-white hover:border-popjoy-purple-surface'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <input
                                                        type="radio"
                                                        name="fulfillment_type"
                                                        value="pickup"
                                                        checked={
                                                            data.fulfillment_type ===
                                                            'pickup'
                                                        }
                                                        onChange={(e) =>
                                                            handleFulfillmentChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 accent-popjoy-purple"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Gift className="size-5 text-popjoy-purple" />
                                                            <p className="font-plus-jakarta text-base font-bold text-popjoy-ink">
                                                                Collect in store
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs leading-relaxed text-popjoy-muted">
                                                            Collect your
                                                            celebration order
                                                            with no extra charge
                                                            — ready when you
                                                            arrive!
                                                        </p>
                                                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-popjoy-gold/20 px-3 py-1 text-xs font-extrabold text-popjoy-gold-ink">
                                                            FREE
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>

                                            <label
                                                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                                                    data.fulfillment_type ===
                                                    'delivery'
                                                        ? 'border-popjoy-purple bg-popjoy-purple-bg/50 shadow-[0_4px_18px_-10px_rgba(99,14,212,0.4)]'
                                                        : 'border-popjoy-divider/60 bg-white hover:border-popjoy-purple-surface'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <input
                                                        type="radio"
                                                        name="fulfillment_type"
                                                        value="delivery"
                                                        checked={
                                                            data.fulfillment_type ===
                                                            'delivery'
                                                        }
                                                        onChange={(e) =>
                                                            handleFulfillmentChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 accent-popjoy-purple"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="size-5 text-popjoy-purple" />
                                                            <p className="font-plus-jakarta text-base font-bold text-popjoy-ink">
                                                                Hand delivery
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs leading-relaxed text-popjoy-muted">
                                                            We bring the party
                                                            to your door — enter
                                                            your postcode to
                                                            check availability.
                                                        </p>
                                                        {matchedDeliveryZone ? (
                                                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-popjoy-purple/10 px-3 py-1 text-xs font-extrabold text-popjoy-purple">
                                                                From{' '}
                                                                {formatCurrency(
                                                                    matchedDeliveryZone.delivery_price,
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-popjoy-divider/50 px-3 py-1 text-xs font-extrabold text-popjoy-muted">
                                                                Postcode check
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="mt-6 space-y-2 rounded-2xl border border-popjoy-divider/70 bg-popjoy-bg/50 p-5">
                                            <Label
                                                htmlFor="expected_at"
                                                className="text-xs font-bold tracking-wide text-popjoy-ink"
                                            >
                                                {data.fulfillment_type ===
                                                'delivery'
                                                    ? 'Delivery date and time'
                                                    : 'Collection date and time'}{' '}
                                                *
                                            </Label>
                                            <Input
                                                id="expected_at"
                                                type="datetime-local"
                                                min={
                                                    data.fulfillment_type ===
                                                    'delivery'
                                                        ? minimumDeliveryAt
                                                        : minimumExpectedAt
                                                }
                                                required
                                                value={data.expected_at}
                                                onChange={(e) =>
                                                    setData(
                                                        'expected_at',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 rounded-xl border-popjoy-divider/80 bg-white focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                            />
                                            <p className="text-xs text-popjoy-muted">
                                                Preparation takes up to{' '}
                                                {maximumTurnoverTimeHours}{' '}
                                                {maximumTurnoverTimeHours === 1
                                                    ? 'hour'
                                                    : 'hours'}{' '}
                                                based on the longest-turnaround
                                                item. Delivery is available from
                                                3:00 PM onwards.
                                            </p>
                                            <InputError
                                                message={errors.expected_at}
                                            />
                                        </div>

                                        {/* Delivery address fields */}
                                        {data.fulfillment_type ===
                                            'delivery' && (
                                            <div className="mt-6 space-y-4 rounded-2xl bg-popjoy-purple-bg/40 p-5">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="size-4 text-popjoy-purple" />
                                                    <p className="text-sm font-bold text-popjoy-ink">
                                                        Delivery address
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="address_line1"
                                                        className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                    >
                                                        Address Line 1 *
                                                    </Label>
                                                    <Input
                                                        id="address_line1"
                                                        className="h-11 rounded-xl border-popjoy-divider/80 bg-white focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                        value={
                                                            data.address_line1
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'address_line1',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="House number and street"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.address_line1
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="address_line2"
                                                        className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                    >
                                                        Address Line 2
                                                        (optional)
                                                    </Label>
                                                    <Input
                                                        id="address_line2"
                                                        className="h-11 rounded-xl border-popjoy-divider/80 bg-white focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                        value={
                                                            data.address_line2
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'address_line2',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="city"
                                                            className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                        >
                                                            City *
                                                        </Label>
                                                        <Input
                                                            id="city"
                                                            className="h-11 rounded-xl border-popjoy-divider/80 bg-white focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                            value={data.city}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'city',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.city
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="delivery_postcode"
                                                            className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                        >
                                                            Postcode *
                                                        </Label>
                                                        <Input
                                                            id="delivery_postcode"
                                                            className="h-11 rounded-xl border-popjoy-divider/80 bg-white font-medium tracking-wide uppercase focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                            value={
                                                                data.delivery_postcode
                                                            }
                                                            onChange={(e) =>
                                                                handleDeliveryPostcodeChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="e.g. SW1A 1AA"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.delivery_postcode
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {/* Delivery zone status */}
                                                {deliveryZoneLookupLoading ? (
                                                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-popjoy-divider bg-popjoy-bg/60 p-3.5 text-xs text-popjoy-muted">
                                                        <div className="size-4 animate-spin rounded-full border-2 border-popjoy-purple border-t-transparent" />
                                                        Checking your delivery
                                                        zone…
                                                    </div>
                                                ) : matchedDeliveryZone ? (
                                                    <div className="mt-3 rounded-xl border border-green-300 bg-green-50 p-3.5 text-sm text-green-900">
                                                        <p className="flex items-center gap-2 font-bold">
                                                            🎉{' '}
                                                            {
                                                                matchedDeliveryZone.name
                                                            }
                                                        </p>
                                                        <p className="mt-0.5 text-xs">
                                                            Delivery:{' '}
                                                            {formatCurrency(
                                                                matchedDeliveryZone.delivery_price,
                                                            )}
                                                            {matchedDeliveryZone.min_order_amount && (
                                                                <>
                                                                    {' '}
                                                                    · Minimum
                                                                    order:{' '}
                                                                    {formatCurrency(
                                                                        matchedDeliveryZone.min_order_amount,
                                                                    )}
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                ) : canLookupDeliveryZone ? (
                                                    <div className="mt-3 rounded-xl border border-[#bd3154]/40 bg-[#bd3154]/5 p-3.5 text-sm text-[#bd3154]">
                                                        {deliveryZoneMessage ??
                                                            'Sorry, we don’t deliver to this area yet.'}
                                                    </div>
                                                ) : null}

                                                {belowMinimum && (
                                                    <p className="text-xs font-semibold text-[#bd3154]">
                                                        Your cart is below the
                                                        minimum order amount for
                                                        this delivery zone.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </section>

                                    {/* Loyalty rewards */}
                                    <section className="relative overflow-hidden rounded-[1.5rem] border border-popjoy-divider/50 bg-white p-6 shadow-[0_6px_24px_-14px_rgba(99,14,212,0.2)] sm:p-7">
                                        <span
                                            aria-hidden
                                            className="absolute top-5 right-8 size-1.5 rounded-full bg-popjoy-gold/90"
                                        />
                                        <div className="mb-5 flex items-center gap-2.5">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-popjoy-gold/20">
                                                <span className="font-plus-jakarta text-base font-extrabold text-popjoy-gold-ink">
                                                    3
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                                                    Loyalty rewards
                                                </h2>
                                                <p className="text-xs text-popjoy-muted">
                                                    Earn{' '}
                                                    {pointsPerCurrencyUnit.toFixed(
                                                        2,
                                                    )}{' '}
                                                    points per £1 — redeem
                                                    points for a discount!
                                                </p>
                                            </div>
                                        </div>

                                        {!loyaltySettings.is_active && (
                                            <p className="rounded-xl bg-popjoy-bg/60 px-3.5 py-2.5 text-sm text-popjoy-muted">
                                                The loyalty program is currently
                                                unavailable.
                                            </p>
                                        )}

                                        {loyaltySettings.is_active &&
                                            loyaltyLookupLoading && (
                                                <p className="text-sm text-popjoy-muted">
                                                    🔍 Checking your loyalty
                                                    balance…
                                                </p>
                                            )}

                                        {loyaltySettings.is_active &&
                                            !loyaltyLookupLoading &&
                                            !loyaltyAccount &&
                                            data.email.trim() !== '' && (
                                                <div className="rounded-xl bg-popjoy-bg/60 px-3.5 py-2.5 text-sm text-popjoy-muted">
                                                    No loyalty account was found
                                                    for this email.
                                                </div>
                                            )}

                                        {loyaltyAccount && (
                                            <div className="rounded-2xl border border-popjoy-gold-border/70 bg-gradient-to-br from-popjoy-gold/10 via-popjoy-gold/5 to-popjoy-purple-bg/50 p-5">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-plus-jakarta text-sm font-bold text-popjoy-ink">
                                                            ✨ Loyalty member
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-popjoy-muted">
                                                            Balance:{' '}
                                                            <span className="font-bold text-popjoy-ink">
                                                                {Number(
                                                                    loyaltyAccount.points_balance,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                points
                                                            </span>{' '}
                                                            · Worth{' '}
                                                            {formatCurrency(
                                                                availablePoints *
                                                                    pointsValue,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    <Label
                                                        htmlFor="loyalty_points"
                                                        className="text-xs font-bold tracking-wide text-popjoy-ink"
                                                    >
                                                        Points to redeem
                                                    </Label>
                                                    <Input
                                                        id="loyalty_points"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        max={
                                                            maxRedeemablePoints
                                                        }
                                                        className="h-11 rounded-xl border-popjoy-divider/80 bg-white focus:border-popjoy-purple focus:ring-popjoy-purple/20"
                                                        value={
                                                            data.loyalty_points
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'loyalty_points',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="0"
                                                    />
                                                    <p className="text-xs text-popjoy-muted">
                                                        Redeem up to{' '}
                                                        <span className="font-semibold text-popjoy-ink">
                                                            {maxRedeemablePoints.toFixed(
                                                                2,
                                                            )}{' '}
                                                            points
                                                        </span>{' '}
                                                        on this order ={' '}
                                                        {formatCurrency(
                                                            maxRedeemablePoints *
                                                                pointsValue,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {paymentError && (
                                        <div className="rounded-xl border border-[#bd3154]/50 bg-[#bd3154]/5 p-4 text-sm text-[#bd3154]">
                                            {paymentError}
                                        </div>
                                    )}

                                    {/* Continue to payment CTA */}
                                    <Button
                                        type="submit"
                                        className="h-14 w-full rounded-full bg-gradient-to-r from-popjoy-gold to-[#ffd447] px-8 text-base font-extrabold text-[#27103f] shadow-[0_12px_30px_-8px_rgba(255,212,71,0.8)] transition-transform hover:scale-[1.01]"
                                    >
                                        <CreditCard className="size-5" />
                                        Continue to secure payment
                                    </Button>
                                </form>
                            )}

                            {/* Step 2: Stripe card payment */}
                            {paymentStep === 'payment' &&
                                clientSecret !== null &&
                                stripePromise && (
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'stripe',
                                                variables: {
                                                    colorPrimary: '#630ed4',
                                                    borderRadius: '14px',
                                                },
                                            },
                                        }}
                                    >
                                        <StripePaymentForm
                                            clientSecret={clientSecret}
                                            data={data}
                                            appliedLoyaltyPoints={
                                                appliedLoyaltyPoints
                                            }
                                            onBack={handleBackToDetails}
                                            onError={setPaymentError}
                                            error={paymentError}
                                        />
                                    </Elements>
                                )}

                            {paymentStep === 'processing' && (
                                <div className="flex items-center justify-center rounded-[2rem] border border-popjoy-divider/60 bg-white p-16 shadow-sm">
                                    <div className="size-9 animate-spin rounded-full border-[3px] border-popjoy-purple border-t-transparent" />
                                    <span className="ml-4 font-medium text-popjoy-muted">
                                        Preparing your secure checkout…
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Sticky order summary sidebar */}
                        <aside className="h-fit space-y-5 lg:sticky lg:top-28">
                            <div className="relative overflow-hidden rounded-[2rem] border border-popjoy-divider/50 bg-white shadow-[0_12px_40px_-20px_rgba(99,14,212,0.3)]">
                                <span
                                    aria-hidden
                                    className="absolute top-5 left-7 size-1.5 rounded-full bg-popjoy-gold/80"
                                />
                                <span
                                    aria-hidden
                                    className="absolute top-8 right-12 size-1 rounded-full bg-popjoy-purple/40"
                                />

                                <div className="p-6 sm:p-7">
                                    <div className="mb-5 flex items-center gap-2">
                                        <PartyPopper className="size-5 text-popjoy-purple" />
                                        <h2 className="font-plus-jakarta text-xl font-bold text-popjoy-ink">
                                            Order summary
                                        </h2>
                                    </div>

                                    {/* Item list */}
                                    <ul className="scrollbar-hide max-h-72 space-y-3 overflow-y-auto pr-1 text-sm">
                                        {cart.items.map((item) => (
                                            <li
                                                key={item.line_key}
                                                className="space-y-1.5 border-b border-popjoy-divider/40 pb-3 last:border-0 last:pb-0"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="min-w-0 flex-1 pr-1 text-[13px] leading-snug">
                                                        <span className="font-semibold text-popjoy-ink">
                                                            {item.name}
                                                        </span>
                                                        {item.variant_name && (
                                                            <span className="text-popjoy-muted">
                                                                {' '}
                                                                (
                                                                {
                                                                    item.variant_name
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                        <span className="ml-1 font-bold text-popjoy-muted">
                                                            ×{item.quantity}
                                                        </span>
                                                    </span>
                                                    <span className="shrink-0 font-semibold text-popjoy-ink tabular-nums">
                                                        {formatCurrency(
                                                            item.line_total,
                                                        )}
                                                    </span>
                                                </div>

                                                {(item.customization_primary_color ||
                                                    item.customization_secondary_color ||
                                                    item.customization_text ||
                                                    item.customization_font) && (
                                                    <div className="space-y-0.5 text-[11px] text-popjoy-muted">
                                                        {item.customization_primary_color && (
                                                            <p>
                                                                Primary:{' '}
                                                                {
                                                                    item
                                                                        .customization_primary_color
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                        {item.customization_secondary_color && (
                                                            <p>
                                                                Secondary:{' '}
                                                                {
                                                                    item
                                                                        .customization_secondary_color
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                        {item.customization_text && (
                                                            <p className="truncate">
                                                                ✏️{' '}
                                                                {
                                                                    item.customization_text
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {item.add_ons &&
                                                    item.add_ons.length > 0 && (
                                                        <div className="space-y-0.5 text-[11px] text-popjoy-muted">
                                                            {item.add_ons.map(
                                                                (addOn) => (
                                                                    <p
                                                                        key={
                                                                            addOn.id
                                                                        }
                                                                    >
                                                                        +{' '}
                                                                        {
                                                                            addOn.name
                                                                        }{' '}
                                                                        ×
                                                                        {
                                                                            addOn.quantity
                                                                        }
                                                                    </p>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}

                                                {item.preorder && (
                                                    <p className="text-[11px] font-semibold text-amber-700">
                                                        📦 Pre-order item
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Totals breakdown */}
                                    <div className="mt-5 space-y-2.5 border-t border-popjoy-divider/60 pt-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-popjoy-muted">
                                                Subtotal
                                            </span>
                                            <span className="font-semibold text-popjoy-ink tabular-nums">
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-popjoy-muted">
                                                Delivery
                                            </span>
                                            <span className="font-semibold text-popjoy-ink tabular-nums">
                                                {data.fulfillment_type ===
                                                'pickup'
                                                    ? 'Free collection'
                                                    : deliveryZoneLookupLoading
                                                      ? 'Checking…'
                                                      : matchedDeliveryZone
                                                        ? formatCurrency(
                                                              deliveryPrice,
                                                          )
                                                        : canLookupDeliveryZone
                                                          ? 'Outside zone'
                                                          : 'Enter postcode'}
                                            </span>
                                        </div>
                                        {loyaltyDiscount > 0 && (
                                            <div className="flex items-center justify-between text-green-700">
                                                <span className="text-xs font-semibold">
                                                    🎁 Loyalty (
                                                    {appliedLoyaltyPoints.toFixed(
                                                        2,
                                                    )}{' '}
                                                    pts)
                                                </span>
                                                <span className="font-bold tabular-nums">
                                                    -
                                                    {formatCurrency(
                                                        loyaltyDiscount,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Grand total banner */}
                                    <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-popjoy-purple via-[#7c3aed] to-popjoy-purple px-5 py-5 shadow-[0_12px_30px_-10px_rgba(99,14,212,0.6)]">
                                        <span
                                            aria-hidden
                                            className="absolute top-3 left-6 size-1.5 animate-float-fast rounded-full bg-popjoy-gold"
                                        />
                                        <span
                                            aria-hidden
                                            className="absolute right-10 bottom-3 size-2 animate-float-slow rounded-full bg-white/40"
                                            style={{ animationDelay: '0.5s' }}
                                        />
                                        <span
                                            aria-hidden
                                            className="absolute top-4 right-5 size-1 rounded-full bg-popjoy-gold/90"
                                        />
                                        <div className="relative flex items-end justify-between">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="size-4 text-popjoy-gold" />
                                                    <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                                                        Grand Total
                                                    </span>
                                                </div>
                                                {loyaltySettings.is_active && (
                                                    <p className="mt-1 text-[11px] text-white/70">
                                                        Earn ≈{' '}
                                                        {estimatedEarnPoints.toFixed(
                                                            2,
                                                        )}{' '}
                                                        pts
                                                    </p>
                                                )}
                                            </div>
                                            <span className="font-plus-jakarta text-3xl font-extrabold text-white tabular-nums">
                                                {formatCurrency(grandTotal)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Back to cart */}
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="mt-5 h-11 w-full rounded-full border-2 border-popjoy-divider bg-white text-sm font-bold text-popjoy-purple transition-colors hover:border-popjoy-purple/40 hover:bg-popjoy-purple-bg/60"
                                    >
                                        <Link href="/cart">
                                            ← Back to basket
                                        </Link>
                                    </Button>

                                    {/* Secure checkout badges */}
                                    <div className="mt-5 grid grid-cols-3 gap-1 border-t border-popjoy-divider/50 pt-4 text-[10px]">
                                        <div className="flex flex-col items-center text-center text-popjoy-muted">
                                            <Lock className="size-4 text-popjoy-purple" />
                                            <span className="mt-1 font-bold text-popjoy-ink">
                                                SSL
                                            </span>
                                            <span>Encrypted</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center text-popjoy-muted">
                                            <CreditCard className="size-4 text-popjoy-purple" />
                                            <span className="mt-1 font-bold text-popjoy-ink">
                                                Stripe
                                            </span>
                                            <span>Secure pay</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center text-popjoy-muted">
                                            <span className="text-lg">💝</span>
                                            <span className="mt-1 font-bold text-popjoy-ink">
                                                5★
                                            </span>
                                            <span>Trusted</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

type StripePaymentFormProps = {
    clientSecret: string;
    data: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        notes: string;
        fulfillment_type: string;
        expected_at: string;
        delivery_postcode: string;
        address_line1: string;
        address_line2: string;
        city: string;
    };
    appliedLoyaltyPoints: number;
    onBack: () => void;
    onError: (msg: string | null) => void;
    error: string | null;
};

/**
 * Inner step-2 form — hosted inside `<Elements>` provider.
 * Renders the Stripe CardElement inside the celebration UI,
 * handles `confirmCardPayment`-style submission via the
 * `stripe.confirmPayment` flow, then POSTs the finalised
 * order details back to the server.
 */
function StripePaymentForm({
    clientSecret,
    data,
    appliedLoyaltyPoints,
    onBack,
    onError,
    error,
}: StripePaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    // Extract `pi_xxx` id from the client secret format `pi_xxx_secret_yyy`.
    // We send this id to the server-side confirm endpoint so it knows which
    // PaymentIntent to re-fetch and verify against Stripe.
    const paymentIntentId = clientSecret.split('_secret_')[0] ?? '';

    const handlePay = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!stripe || !elements) {
            onError('Stripe has not loaded yet. Please try again.');

            return;
        }

        if (!cardComplete) {
            toast.error('Please enter your card details.');

            return;
        }

        setSubmitting(true);
        onError(null);
        setCardError(null);

        try {
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                onError(
                    'Card input has not loaded. Please refresh and try again.',
                );
                setSubmitting(false);

                return;
            }

            const { error: confirmErr, paymentIntent } =
                await stripe.confirmCardPayment(clientSecret, {
                    receipt_email: data.email,
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: `${data.first_name} ${data.last_name}`,
                            email: data.email,
                            phone: data.phone || undefined,
                            address: {
                                city: data.city || undefined,
                                line1: data.address_line1 || undefined,
                                line2: data.address_line2 || undefined,
                                postal_code:
                                    data.delivery_postcode || undefined,
                            },
                        },
                    },
                });

            if (confirmErr) {
                setCardError(
                    confirmErr.message ?? 'Card could not be charged.',
                );
                setSubmitting(false);

                return;
            }

            // 3DS / other redirect flow: if paymentIntent is still
            // processing/requires_action we'll redirect via the Stripe SDK
            // so only reach here once status is 'succeeded'.
            const piStatus = paymentIntent?.status ?? '';

            if (piStatus !== 'succeeded') {
                onError(
                    `Payment not completed (status: ${piStatus || 'unknown'}). Please try again.`,
                );
                setSubmitting(false);

                return;
            }

            // Payment succeeded server-side via confirmCardPayment.
            // Send the final order + capture confirmation to backend.
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content ?? '';

            const response = await fetch('/payment/stripe-confirm', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntentId,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    phone: data.phone || null,
                    notes: data.notes || null,
                    fulfillment_type: data.fulfillment_type,
                    expected_at: data.expected_at,
                    delivery_postcode: data.delivery_postcode || null,
                    address_line1: data.address_line1 || null,
                    address_line2: data.address_line2 || null,
                    city: data.city || null,
                    loyalty_points: appliedLoyaltyPoints,
                }),
            });

            let result: {
                success?: boolean;
                error?: string;
                message?: string;
                redirectUrl?: string;
                errors?: Record<string, string[]>;
            } = {};

            try {
                result = (await response.json()) as typeof result;
            } catch {
                // Backend returned non-JSON (HTML error page, redirect, etc).
                // Expose a helpful error instead of the generic network toast.
                onError('Server returned an invalid response. Please retry.');
                setSubmitting(false);

                return;
            }

            if (!response.ok || !result.success || !result.redirectUrl) {
                // Try to extract a Laravel validation error first, then
                // fall back to the explicit error/message fields we return.
                const firstValidation = Object.values(
                    result.errors ?? {},
                )[0]?.[0];
                onError(
                    result.error ??
                        firstValidation ??
                        result.message ??
                        'Order could not be finalised after payment.',
                );
                setSubmitting(false);

                return;
            }

            router.visit(result.redirectUrl);
        } catch (err) {
            // Unexpected JS-level exception (network drop, confirmPayment
            // throw, etc.) — still try to expose any Stripe native message.
            const fallback =
                err instanceof Error && err.message
                    ? err.message
                    : 'Network error during payment. Please try again.';
            onError(fallback);
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handlePay} className="space-y-6">
            <section className="relative overflow-hidden rounded-[1.5rem] border border-popjoy-divider/50 bg-white p-6 shadow-[0_6px_24px_-14px_rgba(99,14,212,0.2)] sm:p-7">
                <span
                    aria-hidden
                    className="absolute top-5 right-7 size-1.5 rounded-full bg-popjoy-gold"
                />
                <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-popjoy-purple/10">
                        <span className="font-plus-jakarta text-base font-extrabold text-popjoy-purple">
                            2
                        </span>
                    </div>
                    <div>
                        <h2 className="font-plus-jakarta text-lg font-bold text-popjoy-ink">
                            Payment details
                        </h2>
                        <p className="text-xs text-popjoy-muted">
                            Pay securely with your card — powered by Stripe
                        </p>
                    </div>
                </div>

                {/* Stripe card element wrapper with celebration styling */}
                <div className="rounded-2xl border-2 border-popjoy-divider/70 bg-gradient-to-br from-popjoy-purple-bg/40 via-white to-popjoy-gold/10 p-5 transition-all focus-within:border-popjoy-purple focus-within:ring-2 focus-within:ring-popjoy-purple/20">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wide text-popjoy-purple">
                            CARD DETAILS
                        </span>
                        <div className="flex items-center gap-1 text-xs text-popjoy-muted">
                            <Lock className="size-3 text-popjoy-purple" />
                            Secured by Stripe
                        </div>
                    </div>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    color: '#201637',
                                    fontFamily:
                                        "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                                    fontSize: '16px',
                                    '::placeholder': {
                                        color: '#7b7487',
                                    },
                                },
                                invalid: {
                                    color: '#bd3154',
                                },
                            },
                            hidePostalCode: true,
                        }}
                        onChange={(ev) => {
                            setCardComplete(ev.complete);

                            if (ev.error) {
                                setCardError(ev.error.message ?? null);
                            } else {
                                setCardError(null);
                            }
                        }}
                    />
                </div>

                {cardError && (
                    <p className="mt-3 rounded-xl bg-[#bd3154]/5 px-3.5 py-2.5 text-sm text-[#bd3154]">
                        {cardError}
                    </p>
                )}
                {error && (
                    <p className="mt-3 rounded-xl bg-[#bd3154]/5 px-3.5 py-2.5 text-sm text-[#bd3154]">
                        {error}
                    </p>
                )}

                {/* Lock / guarantee note */}
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-popjoy-purple-bg/50 p-4 text-xs text-popjoy-muted">
                    <Lock className="mt-0.5 size-4 shrink-0 text-popjoy-purple" />
                    <p>
                        Your card details are encrypted end-to-end by Stripe and
                        never stored on Party Eden servers. Your payment is
                        protected by Stripe&apos;s buyer guarantee.
                    </p>
                </div>
            </section>

            {/* Action buttons */}
            <div className="space-y-3">
                <Button
                    type="submit"
                    disabled={submitting || !stripe}
                    className="h-14 w-full rounded-full bg-gradient-to-r from-popjoy-gold to-[#ffd447] px-8 text-base font-extrabold text-[#27103f] shadow-[0_12px_30px_-8px_rgba(255,212,71,0.85)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {submitting ? (
                        <>
                            <div className="size-4 animate-spin rounded-full border-2 border-[#27103f] border-t-transparent" />
                            Processing payment…
                        </>
                    ) : (
                        <>
                            <PartyPopper className="size-5" />
                            Confirm &amp; celebrate!
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={submitting}
                    className="h-12 w-full rounded-full border-2 border-popjoy-divider bg-white text-sm font-bold text-popjoy-purple transition-colors hover:border-popjoy-purple/40 hover:bg-popjoy-purple-bg/60 disabled:opacity-60"
                >
                    ← Back to details
                </Button>
            </div>
        </form>
    );
}
