import { usePage } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StoreWhatsAppBannerProps = {
    /** Banner heading — overrides the default bespoke headline. */
    heading?: string;
    /** Supporting message — overrides the default bespoke copy. */
    message?: string;
    /** CTA button label. */
    ctaLabel?: string;
    /**
     * WhatsApp number in international format without "+" (e.g. 447700900123).
     * Defaults to the shared `whatsapp.number` prop from `config/whatsapp.php`.
     */
    number?: string;
    /** Pre-filled chat message. Defaults to the shared `whatsapp.default_message`. */
    prefillMessage?: string;
    /** Extra classes for the outer section. */
    className?: string;
    /** Optional id for anchor linking. */
    id?: string;
};

/**
 * Reusable "go bespoke via WhatsApp" banner — can be dropped into any
 * storefront page.
 *
 * The WhatsApp number comes from the backend (`config/whatsapp.php`,
 * driven by the `WHATSAPP_NUMBER` env var) and is shared globally as an
 * Inertia prop, so no number is hard-coded in the frontend. The banner
 * renders nothing when WhatsApp is not configured.
 *
 * Default copy: "If you want something bespoke/personal, send us a
 * WhatsApp message to discuss further."
 */
export function StoreWhatsAppBanner({
    heading,
    message,
    ctaLabel = 'Chat on WhatsApp',
    number,
    prefillMessage,
    className,
    id = 'bespoke-whatsapp',
}: StoreWhatsAppBannerProps) {
    // Shared WhatsApp contact configured server-side (see HandleInertiaRequests)
    const whatsapp = usePage().props.whatsapp as
        { number?: string; default_message?: string | null } | undefined;

    const resolvedNumber = number ?? whatsapp?.number ?? '';
    const resolvedMessage =
        prefillMessage ?? whatsapp?.default_message ?? undefined;

    // Hide the banner entirely when no business number is available.
    if (!resolvedNumber) {
        return null;
    }

    // wa.me accepts the message as a URL-encoded query param.
    const href = `https://wa.me/${resolvedNumber}${
        resolvedMessage ? `?text=${encodeURIComponent(resolvedMessage)}` : ''
    }`;

    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className={cn(
                'w-full bg-popjoy-bg px-5 py-8 sm:px-8 sm:py-12',
                className,
            )}
        >
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-popjoy-purple/20 bg-gradient-to-br from-popjoy-purple-soft via-[#f3e8ff] to-[#e9d5ff] p-8 shadow-lg sm:p-10">
                {/* Decorative glow, matching the other home-page banners */}
                <div
                    className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/50 blur-[70px]"
                    aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                    {/* Text column */}
                    <div className="flex max-w-2xl flex-col items-start gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-popjoy-purple/20 bg-white/70 px-3.5 py-1.5 backdrop-blur-md">
                            <MessageCircle className="h-3.5 w-3.5 text-popjoy-purple" />
                            <span className="font-sans text-xs font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                                BESPOKE &amp; PERSONALISED
                            </span>
                        </div>

                        <h2
                            id={`${id}-heading`}
                            className="font-plus-jakarta text-2xl font-extrabold tracking-tight text-[#2a0845] sm:text-3xl lg:text-4xl"
                        >
                            {heading ?? 'Want something bespoke or personal?'}
                        </h2>

                        <p className="font-sans text-base leading-relaxed text-[#2a0845]/80 sm:text-lg">
                            {message ??
                                'If you want something bespoke or personal, send us a WhatsApp message and we’ll be happy to discuss it further with you.'}
                        </p>
                    </div>

                    {/* CTA column */}
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-popjoy-purple px-8 py-4 font-plus-jakarta text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#5b1a8c] hover:shadow-xl sm:w-auto"
                    >
                        <MessageCircle
                            className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12"
                            aria-hidden="true"
                        />
                        <span>{ctaLabel}</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
