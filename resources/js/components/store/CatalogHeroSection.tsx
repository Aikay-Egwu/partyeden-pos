import { cn } from '@/lib/utils';

/**
 * Single trust-pillar tile in the hero trust ribbon.
 */
export type CatalogTrustPillar = {
    /** Icon SVG path (relative to /figma-img/) */
    iconSrc: string;
    /** Bold title line */
    title: string;
    /** Subtitle/description line below the title */
    subtitle: string;
    /** Alt text for the icon image (empty string for decorative) */
    iconAlt?: string;
};

/**
 * Props for the CatalogHeroSection component.
 * Matches Figma `.sectionHeroCatalogBa`: rounded-48 gradient card with
 * decorative blobs, left column (pill + H1 + copy + delivery checker + countdown),
 * right column (384px mosaic image with glass bar), and a 4-tile trust ribbon below.
 */
export type CatalogHeroSectionProps = {
    /** Studio/location label shown above the H1 */
    studioLabel?: string;
    /** H1 main headline (default includes ✨ styled in popjoy-purple-soft) */
    headline?: string;
    /** Descriptive paragraph below the headline */
    description?: string;
    /** Party date string shown in the delivery checker widget (MM/DD/YYYY) */
    partyDate?: string;
    /** UK postcode string shown in the delivery checker widget */
    postcode?: string;
    /** Next-day courier countdown text e.g. "2 hrs 42 mins" */
    countdownDuration?: string;
    /** Arrival estimate text shown after the countdown duration */
    arrivalEstimate?: string;
    /** Trust ribbon tiles; defaults to 4 standard pillars */
    trustPillars?: CatalogTrustPillar[];
    /** Optional additional className for the outer wrapper */
    className?: string;
    /** Optional id attribute for the section */
    id?: string;
};

const defaultTrustPillars: CatalogTrustPillar[] = [
    {
        iconSrc: '/figma-img/mui8bfpc-igfrv9c.svg',
        title: 'Pre-Inflated In Giant Box',
        subtitle: 'Arrives fully styled & weighted',
        iconAlt: '',
    },
    {
        iconSrc: '/figma-img/mui8bfpc-mkkeedd.svg',
        title: '14 Days High-Float',
        subtitle: 'Hi-Float polymer sealant inside',
        iconAlt: '',
    },
    {
        iconSrc: '/figma-img/mui8bfpc-1wyx7r7.svg',
        title: 'Named-Day 1hr Courier',
        subtitle: 'Live tracking right to your event',
        iconAlt: '',
    },
    {
        iconSrc: '/figma-img/mui8bfpc-ls4u61f.svg',
        title: '100% Biodegradable',
        subtitle: 'FSC sustainable natural rubber',
        iconAlt: '',
    },
];

/**
 * Catalog hero section matching Figma `.sectionHeroCatalogBa` spec.
 *
 * Container: rounded-48px gradient card with decorative blurred blobs,
 * shadow, and 40px padding.
 *
 * LEFT column:
 *  - Map-pin pill (studio label)
 *  - PlusJakarta 48px/56 -1.2sp w800 H1 with purple-soft ✨
 *  - 18px/28 muted copy
 *  - rounded-32 delivery checker widget (party date / postcode / gold Check Slots)
 *  - countdown clock pill
 *
 * RIGHT column: 384px mosaic card with bottom glass float-guarantee bar.
 *
 * TRUST RIBBON: 4 icon tiles below the card with top divider border.
 *
 * @example
 * <CatalogHeroSection partyDate="06/14/2025" postcode="SW1A 1AA" />
 */
export function CatalogHeroSection({
    studioLabel = 'Bristol Balloon Artistry • Shipped Nationwide',
    headline = 'Luxury Inflated Balloons Delivered To Their Door',
    description = 'Handcrafted in our Bristol studio, inflated with 100% pure helium, and packaged in giant surprise boxes with 10–14 days guaranteed float. Select your celebration date for morning courier delivery.',
    partyDate = '06/14/2025',
    postcode = 'SW1A 1AA',
    countdownDuration = '2 hrs 42 mins',
    arrivalEstimate = 'for tomorrow 10:30am arrival.',
    trustPillars = defaultTrustPillars,
    className,
    id,
}: CatalogHeroSectionProps) {
    const headingId = `${id ?? 'catalog-hero'}-heading`;
    const [month, day, year] = partyDate.split('/');

    return (
        <section
            id={id}
            role="region"
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start px-10 py-2 pt-1',
                className,
            )}
        >
            <div
                className="relative flex w-full flex-col items-start self-stretch overflow-hidden rounded-[48px] p-10"
                style={{
                    boxShadow: '0 12px 36px -6px rgba(99, 14, 212, 0.08)',
                    backgroundImage:
                        'linear-gradient(155deg, #EEE4FF 0%, #F4EAFF 50%, #FFFFFF 100%)',
                    gap: '24px',
                }}
            >
                <div
                    className="absolute -top-16 -right-16 h-80 w-80 shrink-0 rounded-full blur-[32px]"
                    style={{ background: 'rgba(99, 14, 212, 0.1)' }}
                />
                <div
                    className="absolute -bottom-20 -left-12 z-[1] h-72 w-72 shrink-0 rounded-full blur-[20px]"
                    style={{ background: 'rgba(253, 196, 37, 0.2)' }}
                />

                <div className="relative z-[2] flex h-96 w-full items-center justify-between">
                    <div className="flex flex-col items-start">
                        <div className="mb-2 inline-flex w-full flex-col items-start pb-2">
                            <div
                                className="inline-flex items-center gap-1 self-stretch rounded-full bg-popjoy-purple-surface px-3 py-1"
                                style={{
                                    boxShadow:
                                        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <img
                                    src="/figma-img/mui8bfpc-qeemqzp.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-[15px] w-4 shrink-0"
                                />
                                <span className="font-sans text-xs leading-4 font-semibold tracking-[0.24px] text-[#25005A]">
                                    {studioLabel}
                                </span>
                            </div>
                        </div>

                        <div className="mb-2 flex w-full flex-col items-start pb-2">
                            <h1 id={headingId} className="w-[643px]">
                                <span
                                    className="font-plus-jakarta leading-[56px] tracking-tight text-popjoy-ink"
                                    style={{
                                        fontSize: '48px',
                                        fontWeight: 800,
                                        letterSpacing: '-1.2px',
                                    }}
                                >
                                    {headline}
                                    <span className="text-popjoy-purple-soft">
                                        &nbsp;✨
                                    </span>
                                </span>
                            </h1>
                        </div>

                        <div className="mb-6 flex max-w-[672px] flex-col items-start pb-6">
                            <p
                                className="w-[643px] font-sans text-lg leading-7 text-popjoy-muted"
                                style={{ lineHeight: '28px' }}
                            >
                                {description}
                            </p>
                        </div>

                        <div className="mr-[331px] flex shrink-0 items-center self-stretch rounded-[32px] bg-white pr-px">
                            <div
                                className="flex h-[66px] w-[643px] min-w-[643px] flex-1 items-center justify-between rounded-[32px] px-3 py-3"
                                style={{
                                    boxShadow:
                                        '0 6px 20px -2px rgba(32, 22, 55, 0.06)',
                                    background: 'rgba(255, 255, 255, 0.004)',
                                }}
                            >
                                <div className="flex w-[189px] items-center gap-2 rounded-full bg-popjoy-purple-bg px-3 py-1">
                                    <img
                                        src="/figma-img/mui8bfpc-3qetwgd.svg"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-[17px] w-4 shrink-0"
                                    />
                                    <div className="inline-flex flex-shrink-0 flex-col items-start">
                                        <span className="self-stretch font-sans text-[11px] leading-[14px] font-medium tracking-[0.55px] text-popjoy-muted uppercase">
                                            PARTY DATE
                                        </span>
                                        <div className="flex w-[73px] items-start gap-px overflow-hidden p-px">
                                            <span className="font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                                                {month}
                                            </span>
                                            <span className="font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                                                /
                                            </span>
                                            <span className="font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                                                {day}
                                            </span>
                                            <span className="font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                                                /
                                            </span>
                                            <span className="font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink">
                                                {year}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-[262px] items-center gap-2 rounded-full bg-popjoy-purple-bg px-3 py-1">
                                    <img
                                        src="/figma-img/mui8bfpc-h2ydve1.svg"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-[17px] w-3 shrink-0"
                                    />
                                    <div className="inline-flex flex-shrink-0 flex-col items-start">
                                        <span className="font-sans text-[11px] leading-[14px] font-medium tracking-[0.55px] text-popjoy-muted uppercase">
                                            UK POSTCODE
                                        </span>
                                        <span className="self-stretch overflow-auto font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-ink uppercase">
                                            {postcode}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-1 rounded-full bg-popjoy-gold px-6 py-3"
                                    style={{
                                        boxShadow:
                                            '0 4px 16px 0 rgba(253, 196, 37, 0.35)',
                                    }}
                                >
                                    <img
                                        src="/figma-img/mui8bfpc-q9r4gat.svg"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-4 w-[17px] shrink-0"
                                    />
                                    <span className="font-sans text-sm leading-[18px] font-semibold tracking-[0.14px] text-popjoy-gold-ink">
                                        Check Slots
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 flex shrink-0 items-center gap-2 self-stretch pt-2">
                            <img
                                src="/figma-img/mui8bfpc-hh1h98b.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-3 w-[13px] shrink-0"
                            />
                            <p className="shrink-0 text-[11px] leading-[14px] tracking-[0.33px] text-popjoy-muted">
                                <span className="font-medium">
                                    Next-day courier cutoff: order within&nbsp;
                                </span>
                                <span className="font-bold text-popjoy-muted">
                                    {countdownDuration}
                                </span>
                                <span className="font-medium">
                                    &nbsp;{arrivalEstimate}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-[453px] items-center justify-center">
                        <div
                            className="mx-[34px] flex h-[384px] w-[384px] flex-1 shrink-0 items-center overflow-hidden rounded-[48px] bg-popjoy-purple-surface"
                            style={{
                                boxShadow:
                                    '0 20px 40px -10px rgba(124, 58, 237, 0.22)',
                            }}
                        >
                            <div
                                className="relative h-96 w-96 overflow-hidden"
                                style={{
                                    backgroundImage:
                                        'url(/figma-img/mui8bfq8-bvqsc00.png)',
                                    backgroundPosition: '-160px 0px',
                                    backgroundSize: '183.51% 100%',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            >
                                <div
                                    className="absolute right-3 bottom-3 left-3 flex h-12 w-[360px] items-center rounded-[32px]"
                                    style={{
                                        background: 'rgba(254, 247, 255, 0.9)',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                >
                                    <div
                                        className="flex h-12 w-[360px] min-w-[360px] flex-1 items-center justify-between rounded-[32px] p-2"
                                        style={{
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                            background:
                                                'rgba(255, 255, 255, 0.004)',
                                        }}
                                    >
                                        <div className="inline-flex items-center gap-1">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-popjoy-gold">
                                                <img
                                                    src="/figma-img/mui8bfpc-83o67fa.svg"
                                                    alt=""
                                                    aria-hidden="true"
                                                    className="h-4 w-3 shrink-0"
                                                />
                                            </div>
                                            <div className="inline-flex flex-shrink-0 flex-col items-start">
                                                <span className="self-stretch font-sans text-xs leading-[15px] font-bold tracking-[0.24px] text-popjoy-ink">
                                                    10-14 Days Float Guarantee
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-sans text-xs leading-4 font-bold tracking-[0.24px] text-popjoy-purple">
                                            100% Float
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="z-[3] flex w-full shrink-0 items-start justify-center gap-3 self-stretch border-t pt-[15px]"
                    style={{ borderColor: 'rgba(204, 195, 216, 0.3)' }}
                >
                    {trustPillars.map((pillar, index) => (
                        <div
                            key={`${pillar.title}-${index}`}
                            className="flex flex-1 items-center gap-2"
                        >
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"
                                style={{
                                    boxShadow:
                                        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <img
                                    src={pillar.iconSrc}
                                    alt={pillar.iconAlt ?? ''}
                                    aria-hidden={!pillar.iconAlt}
                                    className="h-[15px] w-4"
                                />
                            </div>
                            <div className="inline-flex flex-shrink-0 flex-col items-start">
                                <span className="self-stretch font-sans text-xs leading-4 font-bold tracking-[0.24px] text-popjoy-ink">
                                    {pillar.title}
                                </span>
                                <span className="self-stretch font-sans text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                                    {pillar.subtitle}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
