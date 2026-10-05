import { useState } from 'react';
import { cn } from '@/lib/utils';

const maxCustomTextLength = 35;

type VinylColor = {
    label: string;
    hex: string;
    textShadow: string;
};

const vinylColors: VinylColor[] = [
    {
        label: 'Metallic Mirror Gold',
        hex: '#fdc425',
        textShadow:
            '0 2px 4px rgba(109,82,0,0.25), 0 0 2px rgba(253,196,37,0.6)',
    },
    {
        label: 'Metallic Silver',
        hex: '#aeb4be',
        textShadow:
            '0 2px 4px rgba(48,54,66,0.3), 0 0 2px rgba(174,180,190,0.7)',
    },
    {
        label: 'Rose Gold',
        hex: '#cf817e',
        textShadow:
            '0 2px 4px rgba(88,35,33,0.3), 0 0 2px rgba(207,129,126,0.65)',
    },
    {
        label: 'Pearl White',
        hex: '#fffdf8',
        textShadow:
            '0 1px 3px rgba(32,22,55,0.75), 0 0 4px rgba(32,22,55,0.35)',
    },
    {
        label: 'Midnight Black',
        hex: '#292434',
        textShadow: '0 2px 4px rgba(32,22,55,0.25)',
    },
    {
        label: 'Party Purple',
        hex: '#7c3aed',
        textShadow:
            '0 2px 4px rgba(53,22,105,0.3), 0 0 2px rgba(124,58,237,0.55)',
    },
];

/**
 * Filter tab definition used by FigmaLiveCustomiser filter bar.
 */
export type FigmaFilterTab = {
    /** Tab display label */
    label: string;
    /** Whether this tab is the active/selected one */
    active?: boolean;
};

/**
 * Props for the FigmaLiveCustomiser component.
 * Matches Figma `.liveCustomiserPrevie` inside `.container48`:
 * heading row with eyebrow + title, filter pill tabs,
 * gold LIVE CUSTOMISER banner, custom-bubble form (text, vinyl color, filler, price, CTA),
 * and right-side animated bubble sphere preview with weight string.
 */
export type FigmaLiveCustomiserProps = {
    /** Optional filter tabs array. Falls back to All Delights / Personalised / Numbers / Garlands. */
    filterTabs?: FigmaFilterTab[];
    /** Custom text shown in both the input and the simulated bubble. */
    customText?: string;
    /** Selected vinyl color display label. */
    vinylColor?: string;
    /** Selected internal filler display label. */
    internalFiller?: string;
    /** Display price, e.g. "£34.99". */
    price?: string;
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultFilterTabs: FigmaFilterTab[] = [
    { label: 'All Delights', active: true },
    { label: 'Personalised' },
    { label: 'Numbers' },
    { label: 'Garlands' },
];

/**
 * Live Crystal Bubble customiser section matching the Figma `.liveCustomiserPrevie` spec.
 * Left column: gold "LIVE CUSTOMISER PREVIEW" pill badge, heading,
 * live custom text input, selectable vinyl colours, filler display, price line, and CTA.
 * Right column: giant clear sphere preview with gloss highlight, floating feather/sparkle emojis,
 * simulated custom text in the selected vinyl colour, and hanging weight string with yellow base.
 * Wrapped under the CELEBRATION FAVORITES heading + filter pill tabs from container48.
 *
 * @example
 * <FigmaLiveCustomiser customText="Happy 30th Sophia!" price="£34.99" />
 */
export function FigmaLiveCustomiser({
    filterTabs = defaultFilterTabs,
    customText = 'Happy 30th Sophia!',
    vinylColor = 'Metallic Mirror Gold',
    internalFiller = 'Pastel Feathers & Sequins',
    price = '£34.99',
    className,
    id,
}: FigmaLiveCustomiserProps) {
    const headingId = id ? `${id}-heading` : 'live-customiser-heading';
    const sectionId = id ? `${id}-section` : 'live-customiser-section';
    const [message, setMessage] = useState(
        customText.slice(0, maxCustomTextLength),
    );
    const initialVinylColor = vinylColors.find(
        (color) => color.label === vinylColor,
    ) ?? { ...vinylColors[0], label: vinylColor };
    const [selectedVinylColor, setSelectedVinylColor] =
        useState<VinylColor>(initialVinylColor);
    const customTextInputId = `${sectionId}-custom-text`;
    const messageCountId = `${sectionId}-message-count`;
    const previewFontSize =
        message.length > 26 ? '20px' : message.length > 17 ? '24px' : '28px';

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start bg-popjoy-bg px-8 pt-16 pb-0',
                className,
            )}
        >
            {/* Heading row + filter tabs */}
            <div className="mb-10 flex w-full shrink-0 flex-col items-start justify-between gap-4 self-stretch xl:flex-row xl:items-end">
                <div
                    id={headingId}
                    className="inline-flex flex-col items-start gap-1"
                >
                    <span className="self-stretch font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                        CELEBRATION FAVORITES
                    </span>
                    <h2
                        className="self-stretch font-plus-jakarta leading-[38px] font-bold text-popjoy-ink"
                        style={{ fontSize: '30px' }}
                    >
                        Inflated Bestsellers & Custom Bubbles
                    </h2>
                </div>
                <div className="inline-flex max-w-full shrink-0 flex-wrap items-center gap-1 rounded-full border border-popjoy-purple-surface bg-popjoy-purple-bg px-[7px] py-[5px]">
                    {filterTabs.map((tab, index) => (
                        <button
                            key={`${tab.label}-${index}`}
                            type="button"
                            className={cn(
                                'inline-flex items-center justify-center rounded-full px-[13px] py-[7px] text-sm leading-5 font-bold transition-colors',
                                tab.active
                                    ? 'bg-popjoy-purple text-white shadow-[0px_4px_6px_-1px_rgba(99,14,212,0.2)]'
                                    : 'text-popjoy-muted hover:text-popjoy-purple',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Live customiser + preview row */}
            <div className="mb-10 flex w-full shrink-0 flex-col items-stretch gap-6 self-stretch lg:flex-row lg:items-start">
                {/* Left: customiser form */}
                <div className="flex min-w-0 flex-1 flex-col items-start gap-6 rounded-3xl border border-popjoy-purple-surface bg-white p-5 sm:p-8">
                    {/* Gold customiser banner pill */}
                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-popjoy-gold px-4 py-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                        <img
                            src="/figma-img/muhjqso4-apj8s1y.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[15px] w-[15px] shrink-0"
                        />
                        <span className="font-sans text-xs leading-4 font-bold tracking-[0.6px] text-popjoy-gold-ink uppercase">
                            LIVE CUSTOMISER PREVIEW
                        </span>
                    </div>

                    {/* Heading + subtitle */}
                    <div className="inline-flex shrink-0 flex-col items-start gap-2 self-stretch">
                        <h3 className="self-stretch font-plus-jakarta text-2xl leading-8 font-bold text-popjoy-ink">
                            Design Your Bespoke Crystal Bubble
                        </h3>
                        <p className="self-stretch font-sans text-sm leading-6 text-popjoy-muted">
                            Type your celebration message below to see it
                            rendered instantly on the crystal sphere before
                            ordering!
                        </p>
                    </div>

                    {/* Form fields block */}
                    <div className="flex w-full shrink-0 flex-col items-start gap-5 self-stretch">
                        {/* Custom text input */}
                        <div className="flex shrink-0 flex-col items-start gap-2 self-stretch">
                            <label
                                htmlFor={customTextInputId}
                                className="font-sans text-xs leading-4 font-bold text-popjoy-ink"
                            >
                                Your message
                            </label>
                            <input
                                id={customTextInputId}
                                type="text"
                                maxLength={maxCustomTextLength}
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                aria-describedby={messageCountId}
                                placeholder="e.g. Happy 30th, Sophia!"
                                className="h-[52px] w-full rounded-2xl border-2 border-popjoy-purple-surface bg-popjoy-purple-bg px-5 font-sans text-sm leading-5 font-semibold text-popjoy-ink transition outline-none focus:border-popjoy-purple focus:ring-2 focus:ring-popjoy-purple/20"
                            />
                            <span
                                id={messageCountId}
                                className="self-end font-sans text-xs leading-4 text-popjoy-muted"
                                aria-live="polite"
                            >
                                {message.length}/{maxCustomTextLength}
                            </span>
                        </div>

                        {/* Vinyl colour + filler row */}
                        <div className="flex w-full shrink-0 flex-col items-start gap-5 self-stretch sm:flex-row sm:gap-4">
                            <div
                                className="flex min-w-0 flex-1 flex-col items-start gap-3"
                                role="group"
                                aria-label="Choose vinyl colour"
                            >
                                <span className="font-sans text-xs leading-4 font-bold text-popjoy-ink">
                                    Vinyl colour
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    {vinylColors.map((color) => (
                                        <button
                                            key={color.label}
                                            type="button"
                                            aria-label={color.label}
                                            aria-pressed={
                                                selectedVinylColor.label ===
                                                color.label
                                            }
                                            title={color.label}
                                            onClick={() =>
                                                setSelectedVinylColor(color)
                                            }
                                            className={cn(
                                                'size-9 rounded-full border border-black/10 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple',
                                                selectedVinylColor.label ===
                                                    color.label &&
                                                    'ring-2 ring-popjoy-purple ring-offset-2',
                                            )}
                                            style={{
                                                backgroundColor: color.hex,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="font-sans text-xs leading-4 font-semibold text-popjoy-muted">
                                    {selectedVinylColor.label}
                                </span>
                            </div>

                            {/* Internal filler */}
                            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                                <span className="font-sans text-xs leading-4 font-bold text-popjoy-ink">
                                    Internal filler
                                </span>
                                <div className="flex min-h-[52px] w-full items-center rounded-2xl border-2 border-popjoy-gold-border bg-white px-4 py-3">
                                    <img
                                        src="/figma-img/muhjqso4-ybpz9x2.svg"
                                        alt=""
                                        aria-hidden="true"
                                        className="mr-2 h-[14px] w-[14px] shrink-0"
                                    />
                                    <span className="min-w-0 flex-1 font-sans text-sm leading-5 font-semibold text-popjoy-ink">
                                        {internalFiller}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price + CTA row */}
                        <div className="flex w-full shrink-0 flex-col items-start justify-between gap-4 self-stretch pt-2 sm:flex-row sm:items-end">
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-plus-jakarta text-2xl leading-8 font-bold text-popjoy-ink">
                                    {price}
                                </span>
                                <span className="font-sans text-xs leading-4 text-popjoy-muted">
                                    Fully inflated with weight & courier box
                                </span>
                            </div>
                            <button
                                type="button"
                                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-popjoy-purple px-6 py-[14px] transition-opacity hover:opacity-90"
                                style={{
                                    boxShadow:
                                        '0px 10px 15px -3px rgba(99,14,212,0.25), 0px 4px 6px -4px rgba(99,14,212,0.25)',
                                }}
                            >
                                <img
                                    src="/figma-img/muhjqso4-hqnjm3d.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[18px] w-[18px] shrink-0"
                                />
                                <span className="font-plus-jakarta text-sm leading-5 font-bold tracking-[0.35px] text-white">
                                    Add To Celebration Box
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: bubble preview card */}
                <div className="flex min-h-[460px] w-full shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-popjoy-purple-surface bg-popjoy-purple-bg p-5 sm:p-6 lg:h-[580px] lg:w-[440px]">
                    {/* Sphere + weight container */}
                    <div className="flex w-full max-w-[340px] flex-col items-center">
                        {/* Giant clear sphere */}
                        <div
                            role="img"
                            aria-label={`Crystal bubble preview with ${message || 'no message'} in ${selectedVinylColor.label} vinyl`}
                            className="relative flex aspect-square w-full max-w-[340px] items-center justify-center overflow-hidden rounded-full"
                            style={{
                                background:
                                    'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 25%, rgba(255,255,255,0.25) 55%, rgba(234,221,255,0.35) 100%)',
                                boxShadow:
                                    'inset 0 20px 50px rgba(255,255,255,0.6), inset 0 -15px 40px rgba(99,14,212,0.08), 0 20px 40px rgba(99,14,212,0.12)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            {/* Gloss highlight */}
                            <div
                                className="absolute rounded-full"
                                style={{
                                    top: '11%',
                                    left: '18%',
                                    width: '24%',
                                    height: '15%',
                                    background:
                                        'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
                                }}
                            />
                            {/* Floating feather */}
                            <div
                                className="absolute animate-float-slow"
                                style={{ top: '26%', left: '22%' }}
                            >
                                <span
                                    aria-hidden="true"
                                    className="text-2xl leading-6"
                                >
                                    🪶
                                </span>
                            </div>
                            {/* Sparkle emoji */}
                            <div
                                className="absolute animate-float"
                                style={{ top: '35%', right: '26%' }}
                            >
                                <span
                                    aria-hidden="true"
                                    className="text-xl leading-6"
                                >
                                    ✨
                                </span>
                            </div>
                            {/* Custom simulated text on sphere */}
                            <div className="flex max-w-full items-center justify-center px-10 text-center">
                                <span
                                    className="max-w-full font-plus-jakarta leading-tight font-bold break-all"
                                    style={{
                                        fontSize: previewFontSize,
                                        color: selectedVinylColor.hex,
                                        textShadow:
                                            selectedVinylColor.textShadow,
                                    }}
                                >
                                    {message || 'Your message here'}
                                </span>
                            </div>
                        </div>

                        {/* Weight string + base */}
                        <div className="flex flex-col items-center">
                            {/* Vertical string divider */}
                            <div
                                className="w-px bg-popjoy-divider"
                                style={{ height: '44px' }}
                            />
                            {/* Yellow weight base */}
                            <div className="flex items-center justify-center rounded-xl bg-popjoy-gold px-4 py-2 shadow-[0px_4px_10px_-2px_rgba(253,196,37,0.4)]">
                                <span className="font-sans text-[10px] leading-4 font-bold tracking-[1px] text-popjoy-gold-ink uppercase">
                                    WEIGHT
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
