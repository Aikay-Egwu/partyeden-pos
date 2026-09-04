import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PaypalButton from '@/components/PaypalButton';
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
};

type PaymentStep = 'form' | 'paypal' | 'processing';

/**
 * Checkout page with delivery pricing, loyalty redemption, and PayPal payment.
 */
export default function CheckoutPage({
    cart,
    customer,
    loyaltySettings,
}: Props) {
    const { props: pageProps } = usePage<{ paypalClientId: string }>();
    const paypalClientId = pageProps.paypalClientId as string;

    const [paymentStep, setPaymentStep] = useState<PaymentStep>('form');
    const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
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
            const response = await fetch('/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
                body: JSON.stringify({
                    email: data.email,
                    fulfillment_type: data.fulfillment_type,
                    delivery_postcode: data.delivery_postcode,
                    loyalty_points: appliedLoyaltyPoints,
                }),
            });

            const result = (await response.json()) as {
                error?: string;
                paypalOrderId?: string;
            };

            if (!response.ok || result.error || !result.paypalOrderId) {
                setPaymentError(result.error ?? 'Could not initiate payment.');
                setPaymentStep('form');

                return;
            }

            setPaypalOrderId(result.paypalOrderId);
            setPaymentStep('paypal');
        } catch {
            setPaymentError('Network error. Please try again.');
            setPaymentStep('form');
        }
    };

    const handlePaypalApprove = async (orderID: string) => {
        setPaymentStep('processing');

        try {
            const response = await fetch('/payment/capture-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
                body: JSON.stringify({
                    paypalOrderId: orderID,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    phone: data.phone || null,
                    notes: data.notes || null,
                    fulfillment_type: data.fulfillment_type,
                    delivery_postcode: data.delivery_postcode || null,
                    address_line1: data.address_line1 || null,
                    address_line2: data.address_line2 || null,
                    city: data.city || null,
                    loyalty_points: appliedLoyaltyPoints,
                }),
            });

            const result = (await response.json()) as {
                success?: boolean;
                error?: string;
                redirectUrl?: string;
            };

            if (!response.ok || !result.success || !result.redirectUrl) {
                setPaymentError(
                    result.error ?? 'Payment could not be completed.',
                );
                setPaymentStep('paypal');

                return;
            }

            router.visit(result.redirectUrl);
        } catch {
            setPaymentError(
                'Network error during payment capture. Please try again.',
            );
            setPaymentStep('paypal');
        }
    };

    const handlePaypalError = (error: Error) => {
        toast.error(`PayPal error: ${error.message}`);
    };

    const handleBackToForm = () => {
        setPaymentStep('form');
        setPaypalOrderId(null);
        setPaymentError(null);
    };

    return (
        <>
            <Head title="Checkout" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Checkout
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Review your order, choose fulfillment, and complete
                        payment securely.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {paymentStep === 'form' && (
                            <form
                                onSubmit={handleContinueToPayment}
                                className="space-y-6"
                            >
                                <div className="space-y-4 rounded-lg border p-6">
                                    <h2 className="text-lg font-medium">
                                        Customer Information
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
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
                                            <Label htmlFor="last_name">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
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
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
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
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
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
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Order Notes (optional)
                                        </Label>
                                        <textarea
                                            id="notes"
                                            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                            placeholder="Any special requirements?"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-lg border p-6">
                                    <h2 className="text-lg font-medium">
                                        Fulfillment
                                    </h2>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="rounded-lg border p-4">
                                            <div className="flex items-start gap-3">
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
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Pickup
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Collect your order with
                                                        no delivery charge.
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                        <label className="rounded-lg border p-4">
                                            <div className="flex items-start gap-3">
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
                                                />
                                                <div>
                                                    <p className="font-medium">
                                                        Delivery
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enter your postcode to
                                                        confirm your delivery
                                                        zone.
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {data.fulfillment_type === 'delivery' && (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="address_line1">
                                                    Address Line 1
                                                </Label>
                                                <Input
                                                    id="address_line1"
                                                    value={data.address_line1}
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
                                                <Label htmlFor="address_line2">
                                                    Address Line 2 (optional)
                                                </Label>
                                                <Input
                                                    id="address_line2"
                                                    value={data.address_line2}
                                                    onChange={(e) =>
                                                        setData(
                                                            'address_line2',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) =>
                                                        setData(
                                                            'city',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.city}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="delivery_postcode">
                                                    Delivery Postcode
                                                </Label>
                                                <Input
                                                    id="delivery_postcode"
                                                    value={
                                                        data.delivery_postcode
                                                    }
                                                    onChange={(e) =>
                                                        handleDeliveryPostcodeChange(
                                                            e.target.value,
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

                                            {deliveryZoneLookupLoading ? (
                                                <div className="rounded-lg border border-muted bg-muted/30 p-4 text-sm text-muted-foreground">
                                                    Checking delivery zone...
                                                </div>
                                            ) : matchedDeliveryZone ? (
                                                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                                                    <p className="font-medium">
                                                        {
                                                            matchedDeliveryZone.name
                                                        }
                                                    </p>
                                                    <p>
                                                        Delivery charge:{' '}
                                                        {formatCurrency(
                                                            matchedDeliveryZone.delivery_price,
                                                        )}
                                                    </p>
                                                    {matchedDeliveryZone.min_order_amount && (
                                                        <p>
                                                            Minimum order:{' '}
                                                            {formatCurrency(
                                                                matchedDeliveryZone.min_order_amount,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : canLookupDeliveryZone ? (
                                                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                                    {deliveryZoneMessage ??
                                                        'Outside delivery zone.'}
                                                </div>
                                            ) : null}

                                            {belowMinimum && (
                                                <p className="text-sm text-destructive">
                                                    Your cart is below the
                                                    minimum order amount for
                                                    this delivery zone.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 rounded-lg border p-6">
                                    <div>
                                        <h2 className="text-lg font-medium">
                                            Loyalty
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Earn {pointsPerCurrencyUnit} points
                                            per £1 spent. Existing customers can
                                            redeem points for a discount.
                                        </p>
                                    </div>

                                    {!loyaltySettings.is_active && (
                                        <p className="text-sm text-muted-foreground">
                                            The loyalty program is currently
                                            unavailable.
                                        </p>
                                    )}

                                    {loyaltySettings.is_active &&
                                        loyaltyLookupLoading && (
                                            <p className="text-sm text-muted-foreground">
                                                Checking loyalty balance...
                                            </p>
                                        )}

                                    {loyaltySettings.is_active &&
                                        !loyaltyLookupLoading &&
                                        !loyaltyAccount &&
                                        data.email.trim() !== '' && (
                                            <p className="text-sm text-muted-foreground">
                                                No active loyalty account was
                                                found for this email address.
                                            </p>
                                        )}

                                    {loyaltyAccount && (
                                        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    Loyalty member
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Balance:{' '}
                                                    {Number(
                                                        loyaltyAccount.points_balance,
                                                    ).toFixed(2)}{' '}
                                                    points
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Value available:{' '}
                                                    {formatCurrency(
                                                        availablePoints *
                                                            pointsValue,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="loyalty_points">
                                                    Points to redeem
                                                </Label>
                                                <Input
                                                    id="loyalty_points"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    max={maxRedeemablePoints}
                                                    value={data.loyalty_points}
                                                    onChange={(e) =>
                                                        setData(
                                                            'loyalty_points',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Redeem up to{' '}
                                                    {maxRedeemablePoints.toFixed(
                                                        2,
                                                    )}{' '}
                                                    points on this order.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {paymentError && (
                                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                                        {paymentError}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                >
                                    Continue to Payment
                                </Button>
                            </form>
                        )}

                        {paymentStep === 'paypal' && paypalOrderId && (
                            <div className="rounded-lg border p-6">
                                <h2 className="mb-4 text-lg font-medium">
                                    Pay with PayPal
                                </h2>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Your order total is ready. Complete payment
                                    in the PayPal window to place your order.
                                </p>

                                {paymentError && (
                                    <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                                        {paymentError}
                                    </div>
                                )}

                                <PaypalButton
                                    paypalOrderId={paypalOrderId}
                                    paypalClientId={paypalClientId}
                                    onApprove={handlePaypalApprove}
                                    onError={handlePaypalError}
                                />

                                <Button
                                    variant="outline"
                                    className="mt-4 w-full"
                                    onClick={handleBackToForm}
                                >
                                    Back to Details
                                </Button>
                            </div>
                        )}

                        {paymentStep === 'processing' && !paypalOrderId && (
                            <div className="flex items-center justify-center rounded-lg border p-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                <span className="ml-3 text-muted-foreground">
                                    Preparing your payment...
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="h-fit space-y-4 rounded-lg border p-6">
                        <h2 className="text-lg font-medium">Order Summary</h2>
                        <ul className="space-y-3 text-sm">
                            {cart.items.map((item) => (
                                <li key={item.line_key} className="space-y-1">
                                    <div className="flex justify-between gap-3">
                                        <span className="min-w-0 flex-1 pr-2">
                                            {item.name}
                                            {item.variant_name && (
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    ({item.variant_name})
                                                </span>
                                            )}
                                            <span className="text-muted-foreground">
                                                {' '}
                                                x{item.quantity}
                                            </span>
                                        </span>
                                        <span className="shrink-0">
                                            {formatCurrency(item.line_total)}
                                        </span>
                                    </div>
                                    {(item.customization_primary_color ||
                                        item.customization_secondary_color ||
                                        item.customization_text ||
                                        item.customization_font) && (
                                        <div className="space-y-1 text-xs text-muted-foreground">
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
                                                <p>
                                                    Text:{' '}
                                                    {item.customization_text}
                                                </p>
                                            )}
                                            {item.customization_font && (
                                                <p>
                                                    Font:{' '}
                                                    {item.customization_font}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {item.add_ons &&
                                        item.add_ons.length > 0 && (
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                {item.add_ons.map((addOn) => (
                                                    <p key={addOn.id}>
                                                        Add-on: {addOn.name} x
                                                        {addOn.quantity} -{' '}
                                                        {formatCurrency(
                                                            addOn.line_total,
                                                        )}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    {item.preorder && (
                                        <p className="text-xs text-amber-700">
                                            This item will be fulfilled as a
                                            preorder.
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-2 border-t pt-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Delivery
                                </span>
                                <span>
                                    {data.fulfillment_type === 'pickup'
                                        ? 'Free'
                                        : deliveryZoneLookupLoading
                                          ? 'Checking...'
                                          : matchedDeliveryZone
                                            ? formatCurrency(deliveryPrice)
                                            : canLookupDeliveryZone
                                              ? 'Outside zone'
                                              : 'Enter postcode'}
                                </span>
                            </div>
                            {loyaltyDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>
                                        Loyalty (
                                        {appliedLoyaltyPoints.toFixed(2)} pts)
                                    </span>
                                    <span>
                                        -{formatCurrency(loyaltyDiscount)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 border-t pt-2">
                            <div className="flex justify-between text-base font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                            {loyaltySettings.is_active && (
                                <p className="text-xs text-muted-foreground">
                                    Estimated points earned:{' '}
                                    {estimatedEarnPoints.toFixed(2)}
                                </p>
                            )}
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/cart">Back to Cart</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
