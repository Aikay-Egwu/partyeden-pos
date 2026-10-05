import { cn } from '@/lib/utils';

/**
 * Interior fill option card for step 1.
 */
export type FigmaFillOption = {
    /** Main bold label */
    label: string;
    /** Secondary descriptive line */
    sublabel: string;
    /** Preview icon 1 (main fill) */
    icon1Src: string;
    /** Optional preview icon 2 (overlay pattern) */
    icon2Src?: string;
    /** Selected state (by default option 1 is selected) */
    selected?: boolean;
};

/**
 * Font option card for step 3.
 */
export type FigmaFontOption = {
    /** Preview sample text rendered in the option's typeface */
    sample: string;
    /** Style label, e.g. "Signature" */
    style: string;
    /** Secondary descriptor, e.g. "Calligraphy" */
    variant: string;
    /** Selected state */
    selected?: boolean;
};

/**
 * Props for the FigmaProductHeader component.
 * Renders the right-column top card: boutique/save badges, product title,
 * pricing row with strike-through + saving, and the financing row
 * (Klarna/Clearpay + free delivery pill).
 */
export type FigmaProductHeaderProps = {
    /** Badge 1 label, e.g. "Boutique Signature" */
    badge1Label?: string;
    /** Badge 2 label, e.g. "Save 15% Today" */
    badge2Label?: string;
    /** Product heading (may contain \n for line breaks) */
    title?: string;
    /** Current (discounted) price, e.g. "£38.49" */
    priceNow?: string;
    /** Strike-through original price, e.g. "£44.99" */
    priceWas?: string;
    /** "You save £X.XX" label */
    saveLabel?: string;
    /** Klarna / Clearpay installment unit, e.g. "£12.83" */
    installmentAmount?: string;
    /** Free delivery threshold line, may contain \n for line breaks */
    freeDeliveryText?: string;
    /** Optional additional className for the container */
    className?: string;
    /** Optional id attribute for the outer container */
    id?: string;
};

const defaultFills: FigmaFillOption[] = [
    {
        label: 'Luxury Feathers',
        sublabel: 'White & Champagne Gold',
        icon1Src: '/figma-img/mui8gto1-is34lg3.svg',
        icon2Src: '/figma-img/mui8gto1-sxxen76.svg',
        selected: true,
    },
    {
        label: 'Mini Balloons (x5)',
        sublabel: 'Pastel Mix Bunch',
        icon1Src: '/figma-img/mui8gto1-3rqh9n3.svg',
    },
    {
        label: 'Rainbow Confetti',
        sublabel: 'Metallic Shiny Dots',
        icon1Src: '/figma-img/mui8gto1-dvn2xh1.svg',
    },
    {
        label: 'Chrome Glitter',
        sublabel: 'Sparkling Mini Flakes',
        icon1Src: '/figma-img/mui8gto1-jgenqs0.svg',
    },
];

const defaultFonts: FigmaFontOption[] = [
    {
        sample: 'Sophia',
        style: 'Signature',
        variant: 'Calligraphy',
        selected: true,
    },
    { sample: 'SOPHIA', style: 'Chic Serif', variant: 'Romance' },
    { sample: 'Sophia!', style: 'Playful', variant: 'Bold Sans' },
    { sample: 'SOPHIA', style: 'Minimal', variant: 'Clean Caps' },
];

const FOIL_SWATCHES: Array<{
    /** Swatch label / tooltip */
    label: string;
    /** Optional check icon source (selected state) */
    iconSrc?: string;
    /** Selected state */
    selected?: boolean;
    /** CSS background for the swatch */
    background: string;
    /** Border color for the selected ring */
    ring?: string;
}> = [
    {
        label: 'Honey Gold',
        selected: true,
        iconSrc: '/figma-img/mui8gto1-eqyot5i.svg',
        background:
            'linear-gradient(135deg, #fdc425 0%, #f59e0b 50%, #b45309 100%)',
        ring: '#fdc425',
    },
    {
        label: 'Rose Gold',
        background:
            'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #9f1239 100%)',
    },
    {
        label: 'Midnight',
        background:
            'linear-gradient(135deg, #4c1d95 0%, #312e81 50%, #1e1b4b 100%)',
    },
    {
        label: 'Royal Purple',
        background:
            'linear-gradient(135deg, #7c3aed 0%, #630ed4 50%, #4c1d95 100%)',
    },
    {
        label: 'Electric Blue',
        background:
            'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0369a1 100%)',
    },
    {
        label: 'Crisp White',
        background:
            'linear-gradient(135deg, #ffffff 0%, #f3e8ff 50%, #ffffff 100%)',
    },
];

const RIBBON_CHOICES: Array<{ label: string; selected?: boolean }> = [
    { label: 'Royal Purple (Selected)', selected: true },
    { label: 'Champagne Satin' },
    { label: 'Sunny Yellow' },
    { label: 'Ivory Silk' },
];

const TAIL_UPGRADES: Array<{
    label: string;
    desc: string;
    price: string;
    checked?: boolean;
}> = [
    {
        label: 'Add Handcrafted Multi-Tier Tassel Tail',
        desc: 'Includes 4 coordinated metallic and matte tissue tassel tiers',
        price: '+£3.50',
    },
    {
        label: 'Add Warm Fairy LED String Lights inside',
        desc: 'Micro battery pack included under weight base with on/off switch',
        price: '+£4.00',
        checked: true,
    },
];

/**
 * Quick phrase inspiration chips rendered over the two-line
 * vinyl text inputs in step 2.
 */
const QUICK_PHRASES = [
    '[Happy 30th Birthday]',
    '[Marry Me?]',
    '[Baby Shower]',
    '[Retirement]',
];

/**
 * Step 1-7 right-column product customizer.
 * Renders each numbered step block plus the sticky add-to-basket panel
 * floated alongside steps 1-2 (aligned with the customizer flow).
 *
 * Not exported separately: compose the full right column using
 * <FigmaProductHeader /> + <FigmaProductConfigurator />.
 */
export function FigmaProductConfigurator({
    className,
    id,
    onAddToCart,
}: {
    className?: string;
    id?: string;
    onAddToCart?: () => void;
}) {
    return (
        <div
            id={id}
            className={cn(
                'flex w-[528px] shrink-0 flex-col items-start self-stretch',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-4 self-stretch">
                <div className="flex w-[344px] shrink-0 flex-col items-start self-stretch">
                    {/* Step 1: Interior fill */}
                    <StepBlock
                        number={1}
                        title="Choose Interior Fill Style"
                        rightLabel="REQUIRED"
                    >
                        <div className="flex flex-col items-start gap-3 self-stretch">
                            <div className="grid grid-cols-2 gap-3 self-stretch">
                                {defaultFills.map((fill, i) => (
                                    <FillOptionCard key={i} option={fill} />
                                ))}
                            </div>
                        </div>
                    </StepBlock>
                </div>

                {/* Sticky add-to-basket panel */}
                <StickyBasketPanel onAddToCart={onAddToCart} />
            </div>

            {/* Step 2: Personalise vinyl wording */}
            <StepBlock
                number={2}
                title="Personalise Your Vinyl Wording"
                rightLabel="28 / 45 chars"
                rightBadge
            >
                <div className="flex flex-col items-start gap-4 self-stretch">
                    <div className="flex items-center gap-3 self-stretch">
                        <p className="text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                            Inspiration:
                        </p>
                        <div className="flex items-center gap-2">
                            {QUICK_PHRASES.map((phrase, i) => (
                                <button
                                    key={`phrase-${i}`}
                                    type="button"
                                    className="rounded-full border border-popjoy-divider/40 bg-popjoy-purple-bg/50 px-3 py-1 text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-ink transition hover:border-popjoy-purple-surface"
                                >
                                    {phrase}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 self-stretch">
                        <TextLineInput
                            label="Line 1 (Heading / Salutation)"
                            value="Happy 30th Birthday"
                            iconSrc="/figma-img/mui8gto1-3rqh9n3.svg"
                        />
                        <TextLineInput
                            label="Line 2 (Name, Milestone, or Emojis)"
                            value="Sophia! ✨"
                            iconSrc="/figma-img/mui8gto1-jgenqs0.svg"
                        />
                    </div>
                </div>
            </StepBlock>

            {/* Step 3: Font archetype */}
            <StepBlock
                number={3}
                title={
                    <span>
                        Select Font Typography
                        <br />
                        Archetype
                    </span>
                }
                rightLabel={
                    <span className="text-right">
                        Signature
                        <br />
                        Calligraphy
                    </span>
                }
            >
                <div className="grid grid-cols-4 gap-2 self-stretch">
                    {defaultFonts.map((font, i) => (
                        <FontOptionCard key={i} option={font} />
                    ))}
                </div>
            </StepBlock>

            {/* Step 4: Lettering foil color */}
            <StepBlock
                number={4}
                title="Lettering Metallic Foil Colour"
                rightLabel="Metallic Honey Gold"
            >
                <div className="flex items-center gap-3 self-stretch">
                    {FOIL_SWATCHES.map((sw, i) => (
                        <button
                            key={`swatch-${i}`}
                            type="button"
                            aria-label={`Foil: ${sw.label}`}
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition',
                                sw.selected
                                    ? 'border-popjoy-gold'
                                    : 'border-white/0 hover:border-popjoy-divider',
                            )}
                        >
                            <div
                                className="h-8 w-8 rounded-full"
                                style={{
                                    background: sw.background,
                                    boxShadow: sw.selected
                                        ? '0px 4px 6px -1px rgba(0,0,0,0.15), inset 0px 1px 2px 0px rgba(255,255,255,0.5)'
                                        : '0px 1px 2px 0px rgba(0,0,0,0.1)',
                                }}
                            >
                                {sw.iconSrc && sw.selected && (
                                    <img
                                        src={sw.iconSrc}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-8 w-8"
                                    />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </StepBlock>

            {/* Step 5: Ribbon + tail upgrades */}
            <StepBlock
                number={5}
                title="Ribbon & Tail Finishes"
                rightLabel="Bespoke Touches"
                rightBadgeTone="muted"
            >
                <div className="flex flex-col items-start gap-4 self-stretch">
                    <div className="flex flex-col items-start gap-2 self-stretch">
                        <p className="text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                            Satin Bow & String Shade:
                        </p>
                        <div className="grid grid-cols-3 gap-2 self-stretch">
                            <div className="col-span-2 flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2 self-stretch">
                                    {RIBBON_CHOICES.slice(0, 2).map(
                                        (ribbon, i) => (
                                            <button
                                                key={`ribbon-${i}`}
                                                type="button"
                                                className={cn(
                                                    'rounded-full border px-3 py-1.5 text-[11px] leading-[14px] font-semibold transition',
                                                    ribbon.selected
                                                        ? 'border-popjoy-purple bg-popjoy-purple text-white'
                                                        : 'border-popjoy-divider/40 bg-popjoy-purple-bg/40 text-popjoy-ink hover:border-popjoy-purple-surface',
                                                )}
                                            >
                                                {ribbon.label}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                            {RIBBON_CHOICES.slice(2).map((ribbon, i) => (
                                <button
                                    key={`ribbon-extra-${i}`}
                                    type="button"
                                    className="rounded-full border border-popjoy-divider/40 bg-popjoy-purple-bg/40 px-3 py-1.5 text-[11px] leading-[14px] font-medium text-popjoy-ink transition hover:border-popjoy-purple-surface"
                                >
                                    {ribbon.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 self-stretch">
                        {TAIL_UPGRADES.map((up, i) => (
                            <label
                                key={`up-${i}`}
                                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-popjoy-divider/30 bg-white p-3 transition hover:border-popjoy-purple-surface"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2',
                                            up.checked
                                                ? 'border-popjoy-purple bg-popjoy-purple'
                                                : 'border-popjoy-divider/60 bg-white',
                                        )}
                                    >
                                        {up.checked && (
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <p className="text-[14px] leading-[18px] font-bold tracking-[0.14px] text-popjoy-ink">
                                            {up.label}
                                        </p>
                                        <p className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                                            {up.desc}
                                        </p>
                                    </div>
                                </div>
                                <p className="shrink-0 text-[14px] leading-[18px] font-bold tracking-[0.14px] text-popjoy-purple">
                                    {up.price}
                                </p>
                            </label>
                        ))}
                    </div>
                </div>
            </StepBlock>

            {/* Step 6: Delivery date + postcode */}
            <StepBlock
                number={6}
                title="Delivery Date & Postcode Guarantee"
                rightLabel="DPD Tracked"
                rightBadgeTone="green"
            >
                <div className="flex flex-col items-start gap-3 self-stretch">
                    <div className="grid grid-cols-2 gap-3 self-stretch">
                        <div className="flex flex-col items-start gap-2">
                            <p className="text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                                Celebration Date:
                            </p>
                            <div className="flex items-center gap-0.5 rounded-2xl border border-popjoy-divider/40 bg-popjoy-purple-bg/40 px-4 py-2">
                                {['05', '/', '23', '/', '2025'].map(
                                    (seg, i) => (
                                        <span
                                            key={`seg-${i}`}
                                            className={cn(
                                                'font-plus-jakarta text-[15px] leading-6 font-bold',
                                                seg === '/'
                                                    ? 'text-popjoy-muted'
                                                    : 'text-popjoy-ink',
                                            )}
                                        >
                                            {seg}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2">
                            <p className="text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                                Delivery Postcode:
                            </p>
                            <div className="flex items-center gap-2 rounded-2xl border border-popjoy-divider/40 bg-white px-2 py-1">
                                <div className="rounded-xl bg-popjoy-purple-bg/60 px-4 py-2">
                                    <p className="font-plus-jakarta text-[14px] leading-5 font-bold tracking-[0.35px] text-popjoy-ink">
                                        SW1A 1AA
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-xl bg-popjoy-purple px-3 py-2 text-[12px] leading-[16px] font-semibold tracking-[0.24px] text-white"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-stretch rounded-2xl border border-popjoy-gold-border/60 bg-popjoy-gold/5 px-4 py-3">
                        <img
                            src="/figma-img/mui8gto1-95b2yan.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0"
                        />
                        <p className="text-[13px] leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                            <span className="font-bold text-[#065f46]">
                                Next Day Delivery Available
                            </span>
                            <span className="text-popjoy-muted">
                                {' '}
                                for SW1A 1AA. Order before 2:00 PM for
                                <br />
                                guaranteed Friday arrival.
                            </span>
                        </p>
                    </div>
                </div>
            </StepBlock>

            {/* Step 7: Gift note */}
            <StepBlock
                number={7}
                title="Complimentary Keepsake Gift Note"
                rightLabel="Free (£0.00)"
            >
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl border border-popjoy-divider/30 bg-white px-4 py-3 text-left transition hover:border-popjoy-purple-surface"
                >
                    <img
                        src="/figma-img/mui8gto1-d4yrpr0.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-[18px] w-[18px] shrink-0"
                    />
                    <p className="text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                        Click to write your personal wax-sealed card
                    </p>
                </button>
            </StepBlock>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Sub-components used internally by the configurator
   ──────────────────────────────────────────────────────────── */

function StepBlock({
    number,
    title,
    rightLabel,
    rightBadge = false,
    rightBadgeTone = 'purple',
    className,
    children,
}: {
    number: number;
    title: React.ReactNode;
    rightLabel?: React.ReactNode;
    rightBadge?: boolean;
    rightBadgeTone?: 'purple' | 'muted' | 'green';
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'mb-4 flex w-full flex-col items-start gap-3 self-stretch rounded-3xl border border-popjoy-divider/30 bg-white p-4',
                className,
            )}
            style={{
                boxShadow:
                    '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -2px rgba(0,0,0,0.05)',
            }}
        >
            <div className="flex w-full items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-popjoy-purple">
                        <p className="font-plus-jakarta text-[14px] leading-5 font-bold text-white">
                            {number}
                        </p>
                    </div>
                    <p className="font-plus-jakarta text-[17px] leading-6 font-bold text-popjoy-ink">
                        {title}
                    </p>
                </div>
                {rightBadge ? (
                    <span className="rounded-full bg-popjoy-purple-bg px-2.5 py-1 text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {rightLabel}
                    </span>
                ) : rightBadgeTone === 'green' ? (
                    <span className="rounded-full bg-[#d1fae5] px-2.5 py-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] text-[#065f46]">
                        {rightLabel}
                    </span>
                ) : rightBadgeTone === 'muted' ? (
                    <span className="rounded-full bg-popjoy-purple-bg/40 px-2.5 py-1 text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {rightLabel}
                    </span>
                ) : (
                    <span className="text-[13px] leading-[18px] font-semibold text-popjoy-purple">
                        {rightLabel}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function FillOptionCard({ option }: { option: FigmaFillOption }) {
    return (
        <button
            type="button"
            className={cn(
                'flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition',
                option.selected
                    ? 'border-popjoy-purple bg-popjoy-purple-bg/50 ring-2 ring-popjoy-purple/20'
                    : 'border-popjoy-divider/40 bg-white hover:border-popjoy-purple-surface',
            )}
        >
            <div className="flex items-center gap-2">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-popjoy-purple-bg/60">
                    <img
                        src={option.icon1Src}
                        alt=""
                        aria-hidden="true"
                        className="h-[18px] w-[18px] shrink-0"
                    />
                    {option.icon2Src && (
                        <img
                            src={option.icon2Src}
                            alt=""
                            aria-hidden="true"
                            className="absolute -right-1 -bottom-1 h-8 w-8 shrink-0 opacity-80"
                        />
                    )}
                </div>
                <div className="flex flex-col items-start">
                    <p className="text-[14px] leading-[18px] font-bold tracking-[0.14px] text-popjoy-ink">
                        {option.label}
                    </p>
                    <p className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                        {option.sublabel}
                    </p>
                </div>
            </div>
        </button>
    );
}

function FontOptionCard({ option }: { option: FigmaFontOption }) {
    return (
        <button
            type="button"
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center transition',
                option.selected
                    ? 'border-popjoy-gold bg-popjoy-gold/10 ring-2 ring-popjoy-gold/30'
                    : 'border-popjoy-divider/40 bg-white hover:border-popjoy-purple-surface',
            )}
        >
            <p
                className="text-[22px] leading-[26px] text-popjoy-ink"
                style={{
                    fontFamily:
                        option.style === 'Signature'
                            ? '"Brush Script MT", "Plus Jakarta Sans", cursive'
                            : option.style === 'Chic Serif'
                              ? 'Georgia, "Times New Roman", serif'
                              : option.style === 'Playful'
                                ? '"Comic Sans MS", "Plus Jakarta Sans", cursive'
                                : 'Inter, sans-serif',
                    fontWeight:
                        option.style === 'Signature' ||
                        option.style === 'Playful'
                            ? 600
                            : 700,
                }}
            >
                {option.sample}
            </p>
            <p className="mt-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-ink">
                {option.style}
            </p>
            <p className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                {option.variant}
            </p>
        </button>
    );
}

function TextLineInput({
    label,
    value,
    iconSrc,
}: {
    label: string;
    value: string;
    iconSrc: string;
}) {
    return (
        <div className="flex flex-col items-start gap-2 self-stretch">
            <p className="text-[13px] leading-[18px] font-semibold text-popjoy-ink">
                {label}
            </p>
            <div className="flex h-10 w-full items-center justify-between rounded-2xl border border-popjoy-divider/40 bg-popjoy-purple-bg/40 px-3 py-2">
                <p className="text-[14px] leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                    {value}
                </p>
                <img
                    src={iconSrc}
                    alt=""
                    aria-hidden="true"
                    className="h-[14px] w-[14px] shrink-0 opacity-60"
                />
            </div>
        </div>
    );
}

function StickyBasketPanel({ onAddToCart }: { onAddToCart?: () => void }) {
    return (
        <div className="flex w-[328px] shrink-0 flex-col items-start self-stretch rounded-3xl border border-popjoy-divider/30 bg-popjoy-bg p-4">
            <div
                className="flex w-full flex-col items-start gap-4 rounded-3xl border border-popjoy-purple-surface/50 bg-white p-4"
                style={{
                    boxShadow:
                        '0px 10px 15px -3px rgba(99,14,212,0.12), 0px 4px 6px -4px rgba(99,14,212,0.12)',
                }}
            >
                <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex flex-col items-start">
                        <p className="text-[11px] leading-[17px] font-bold tracking-[0.55px] text-popjoy-muted-light uppercase">
                            CONFIGURED TOTAL:
                        </p>
                        <div className="flex items-baseline gap-1">
                            <p className="font-plus-jakarta text-[22px] leading-6 font-bold text-popjoy-ink">
                                £41.99
                            </p>
                            <p className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                                (VAT & helium included)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-popjoy-divider/40 bg-popjoy-purple-bg/60 px-3 py-2">
                        <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="text-[18px] leading-5 font-semibold text-popjoy-ink"
                        >
                            −
                        </button>
                        <p className="w-5 text-center text-[14px] leading-5 font-bold text-popjoy-ink">
                            1
                        </p>
                        <button
                            type="button"
                            aria-label="Increase quantity"
                            className="text-[18px] leading-5 font-semibold text-popjoy-ink"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Primary add CTA */}
                <button
                    type="button"
                    onClick={onAddToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-popjoy-purple px-4 py-3 transition hover:opacity-90"
                    style={{
                        boxShadow:
                            '0px 10px 15px -3px rgba(99,14,212,0.25), 0px 4px 6px -4px rgba(99,14,212,0.25)',
                    }}
                >
                    <img
                        src="/figma-img/mui8gto1-ct7hqqx.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-[17px] w-[16px] shrink-0"
                    />
                    <p className="font-plus-jakarta text-[13px] leading-5 font-bold tracking-[0.35px] text-white">
                        Add Custom Balloon to Basket • Pre-Inflated
                    </p>
                </button>

                {/* Secondary utility actions */}
                <div className="flex items-center gap-2 self-stretch">
                    <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-popjoy-divider/40 bg-popjoy-gold/10 px-2 py-2 transition hover:border-popjoy-gold-border"
                    >
                        <img
                            src="/figma-img/mui8gto1-wmzp4q9.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[12px] w-[9px] shrink-0"
                        />
                        <p className="text-[13px] leading-[18px] text-popjoy-muted">
                            Save Configuration & Share
                        </p>
                    </button>
                    <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-popjoy-divider/40 bg-popjoy-purple-bg/40 px-2 py-2 transition hover:border-popjoy-purple-surface"
                    >
                        <img
                            src="/figma-img/mui8gto1-umpabg0.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[12px] w-[9px] shrink-0"
                        />
                        <p className="text-[13px] leading-[18px] text-popjoy-muted">
                            Ask a Stylist
                        </p>
                    </button>
                </div>

                {/* Payment security strip */}
                <div className="flex items-center justify-between gap-2 self-stretch rounded-2xl border border-popjoy-divider/30 bg-popjoy-purple-bg/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <img
                            src="/figma-img/mui8gto1-004dl4y.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[12px] w-[9px] shrink-0"
                        />
                        <p className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                            256-Bit SSL
                        </p>
                    </div>
                    {[
                        '•',
                        'Apple Pay',
                        '•',
                        'Visa / MC',
                        '•',
                        'PayPal',
                        '•',
                        'Klarna',
                    ].map((t, i) => (
                        <span
                            key={`pay-${i}`}
                            className="text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Top product header block (badges, title, price, financing)
   ──────────────────────────────────────────────────────────── */

/**
 * Right-column product identity header sitting directly above the
 * 7-step customizer. Contains the Boutique Signature / Save badges,
 * product headline, the pricing row (now / was / save), and the
 * Klarna installment + free delivery pill row.
 */
export function FigmaProductHeader({
    badge1Label = 'Boutique Signature',
    badge2Label = 'Save 15% Today',
    title = 'Bespoke Feather &\nConfetti Luxury Bubble',
    priceNow = '£38.49',
    priceWas = '£44.99',
    saveLabel = 'You save £6.50',
    installmentAmount = '£12.83',
    freeDeliveryText = 'Free UK Mainland Delivery on\norders over £45.00',
    className,
    id,
}: FigmaProductHeaderProps) {
    return (
        <div
            id={id}
            className={cn(
                'mb-4 flex w-[528px] shrink-0 flex-col items-start gap-3 self-stretch rounded-3xl border border-popjoy-divider/30 bg-white p-5',
                className,
            )}
            style={{
                boxShadow:
                    '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -2px rgba(0,0,0,0.05)',
            }}
        >
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-popjoy-purple-surface/50 px-3 py-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-purple uppercase">
                    {badge1Label}
                </span>
                <span className="rounded-full bg-popjoy-gold/30 px-3 py-1 text-[11px] leading-[14px] font-bold tracking-[0.33px] text-popjoy-gold-ink uppercase">
                    {badge2Label}
                </span>
            </div>
            <h1 className="font-plus-jakarta text-[32px] leading-[38px] font-bold tracking-[-0.8px] text-popjoy-ink">
                {title.split('\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < title.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </h1>
            <div className="flex items-baseline gap-3">
                <p className="font-plus-jakarta text-[30px] leading-9 font-bold tracking-[-0.4px] text-popjoy-ink">
                    {priceNow}
                </p>
                <p className="text-[18px] leading-6 text-popjoy-muted line-through">
                    {priceWas}
                </p>
                <p className="text-[12px] leading-[16px] font-semibold tracking-[0.24px] text-[#b91c1c]">
                    {saveLabel}
                </p>
            </div>
            <div className="flex flex-col items-start gap-2 self-stretch">
                <div className="flex items-center gap-3 self-stretch rounded-2xl border border-popjoy-divider/30 bg-popjoy-purple-bg/40 px-3 py-2">
                    <img
                        src="/figma-img/mui8gto1-qaig6s0.svg"
                        alt=""
                        aria-hidden="true"
                        className="h-[18px] w-[30px] shrink-0"
                    />
                    <p className="text-[12px] leading-[18px] text-popjoy-muted">
                        Or 3 interest-free payments of{' '}
                        <span className="text-[14px] font-bold tracking-[0.14px] text-popjoy-ink">
                            {installmentAmount}
                        </span>{' '}
                        with
                        <br />
                        Klarna or Clearpay
                    </p>
                </div>
                <div className="flex items-center gap-2 self-stretch rounded-2xl border border-popjoy-gold-border/60 bg-popjoy-gold/10 px-3 py-2">
                    <span className="text-[16px] leading-6">🎉</span>
                    <p className="text-[13px] leading-[18px] font-semibold tracking-[0.14px] text-popjoy-gold-ink">
                        {freeDeliveryText.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                {i <
                                    freeDeliveryText.split('\n').length - 1 && (
                                    <br />
                                )}
                            </span>
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
}
