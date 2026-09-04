import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        paypal?: {
            Buttons: (config: {
                createOrder: () => Promise<string>;
                onApprove: (data: { orderID: string }) => Promise<void>;
                onError?: (err: Error) => void;
                style?: {
                    layout?: 'vertical' | 'horizontal';
                    shape?: 'rect' | 'pill';
                    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
                    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
                };
            }) => {
                render: (selector: string) => void;
            };
        };
    }
}

interface Props {
    paypalOrderId: string;
    paypalClientId: string;
    onApprove: (orderID: string) => Promise<void>;
    onError?: (error: Error) => void;
    onCancel?: () => void;
}

/**
 * PayPal Smart Payment Button.
 *
 * Dynamically loads the PayPal JS SDK and renders the payment button
 * for the given PayPal order ID. The button triggers the PayPal popup,
 * and on approval calls the provided callback.
 */
export default function PaypalButton({
    paypalOrderId,
    paypalClientId,
    onApprove,
    onError,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>(
        'loading',
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const renderButton = useCallback(() => {
        const container = containerRef.current;

        if (!container || !window.paypal) {
            setErrorMessage('PayPal SDK not available.');
            setState('error');

            return;
        }

        // Use a unique ID for the PayPal button target
        const targetId = 'paypal-button-container';
        container.innerHTML = `<div id="${targetId}"></div>`;

        window.paypal
            .Buttons({
                createOrder: () => Promise.resolve(paypalOrderId),
                onApprove: async (data) => {
                    setState('loading');

                    try {
                        await onApprove(data.orderID);
                    } catch {
                        setState('ready');
                    }
                },
                onError: (err: Error) => {
                    setState('ready');
                    onError?.(err);
                },
                style: {
                    layout: 'vertical',
                    shape: 'rect',
                    color: 'gold',
                    label: 'paypal',
                },
            })
            .render(`#${targetId}`);

        setState('ready');
    }, [paypalOrderId, onApprove, onError]);

    useEffect(() => {
        let cancelled = false;

        const loadSdk = () => {
            // Check if SDK is already on the page
            if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
                if (!cancelled) {
                    renderButton();
                }

                return;
            }

            if (!paypalClientId) {
                if (!cancelled) {
                    setErrorMessage('PayPal client ID not configured.');
                    setState('error');
                }

                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=GBP`;
            script.async = true;

            script.onload = () => {
                if (!cancelled) {
                    renderButton();
                }
            };

            script.onerror = () => {
                if (!cancelled) {
                    setErrorMessage('Failed to load PayPal SDK.');
                    setState('error');
                }
            };

            document.head.appendChild(script);
        };

        loadSdk();

        return () => {
            cancelled = true;
        };
    }, [paypalClientId, renderButton]);

    if (state === 'error' && errorMessage) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                {errorMessage}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {state === 'loading' && (
                <div className="flex items-center justify-center rounded-lg border p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Loading PayPal...
                    </span>
                </div>
            )}
            <div
                ref={containerRef}
                className={state === 'loading' ? 'hidden' : ''}
            />
        </div>
    );
}
