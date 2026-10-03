import { Link } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { useSyncExternalStore } from 'react';

/**
 * Storage key used to persist the visitor's cookie consent choice.
 * Stored in both localStorage (fast client-side read) and a first-party
 * cookie (so the choice can be respected server-side if needed).
 */
const CONSENT_STORAGE_KEY = 'cookie_consent';

/**
 * In-memory snapshot of the visitor's consent choice, shared across every
 * instance of this component (only one is mounted at a time).
 *
 * Read once at module load on the client so `getSnapshot` below returns the
 * correct value without needing a state-setting effect.
 */
let consent: string | null =
    typeof window !== 'undefined'
        ? localStorage.getItem(CONSENT_STORAGE_KEY)
        : null;

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
    return consent;
}

// Server-side (and the hydration pass) always shows the banner. React then
// switches to `getSnapshot` after hydration, hiding it if consent exists.
function getServerSnapshot(): string | null {
    return null;
}

/**
 * Persist the visitor's consent choice ("accepted" or "rejected").
 * The cookie lasts one year and is scoped to the whole site.
 */
function persistConsent(value: 'accepted' | 'rejected'): void {
    consent = value;

    if (typeof document !== 'undefined') {
        const maxAge = 365 * 24 * 60 * 60;
        document.cookie = `${CONSENT_STORAGE_KEY}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
        localStorage.setItem(CONSENT_STORAGE_KEY, value);
    }

    listeners.forEach((listener) => listener());
}

/**
 * Cookie consent banner shown at the bottom of the storefront.
 *
 * Appears only until the visitor makes a choice. Offers three actions:
 * accept all, reject non-essential, or view detailed preferences.
 *
 * Note: the site currently sets no third-party analytics/marketing scripts,
 * so this records consent for future use rather than actively loading or
 * unloading any scripts today.
 */
export function CookieConsent() {
    const storedConsent = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    // Consent already given — hide the banner.
    if (storedConsent !== null) {
        return null;
    }

    const choose = (value: 'accepted' | 'rejected') => {
        persistConsent(value);
    };

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:px-6"
        >
            <div className="flex w-full max-w-4xl flex-col gap-4 rounded-3xl border border-popjoy-divider/60 bg-white/95 p-5 shadow-[0_-8px_40px_rgba(32,22,55,0.12)] backdrop-blur sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                <div className="flex items-start gap-4">
                    <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-popjoy-purple-surface"
                    >
                        <Cookie className="h-5 w-5 text-popjoy-purple" />
                    </span>
                    <p className="font-sans text-sm leading-6 text-popjoy-muted">
                        We use cookies and other technologies to keep our site
                        reliable, understand how it is used, and personalise
                        your experience. See our{' '}
                        <Link
                            href="/cookie-policy"
                            className="font-semibold text-popjoy-purple underline-offset-2 hover:underline"
                        >
                            use of cookies and other technologies
                        </Link>{' '}
                        for details.
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-stretch lg:flex-row">
                    <button
                        type="button"
                        onClick={() => choose('accepted')}
                        className="rounded-full bg-popjoy-purple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-popjoy-purple-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                    >
                        Accept all
                    </button>
                    <button
                        type="button"
                        onClick={() => choose('rejected')}
                        className="rounded-full border border-popjoy-divider bg-white px-5 py-2.5 text-sm font-semibold text-popjoy-ink transition-colors hover:bg-popjoy-purple-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                    >
                        Reject
                    </button>
                    <Link
                        href="/cookie-preferences"
                        className="rounded-full px-3 py-2.5 text-sm font-semibold text-popjoy-muted underline-offset-2 transition-colors hover:text-popjoy-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                    >
                        See preferences
                    </Link>
                </div>
            </div>
        </div>
    );
}
