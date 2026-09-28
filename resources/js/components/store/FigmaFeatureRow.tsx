import { cn } from '@/lib/utils';

/**
 * Single feature card definition used by FigmaFeatureRow.
 */
export type FigmaFeature = {
    /** Icon SVG source path */
    iconSrc: string;
    /** Icon alt text for accessibility */
    iconAlt: string;
    /** Feature heading */
    title: string;
    /** Feature description text (can include <br/> line breaks) */
    description: string;
    /** Accent variant — purple card or gold card */
    variant: 'purple' | 'gold';
};

/**
 * Props for the FigmaFeatureRow component.
 * Matches the Figma `.container23` spec — 4 feature cards in a row
 * with alternating purple/gold icon overlays and borders.
 */
export type FigmaFeatureRowProps = {
    /** Optional array of 4 feature definitions. Falls back to the default Party Eden features. */
    features?: FigmaFeature[];
    /** Optional additional className for the row container */
    className?: string;
    /** Optional id attribute for the outer container */
    id?: string;
};

const defaultFeatures: FigmaFeature[] = [
    {
        iconSrc: '/figma-img/muhjqso4-xq1cg2e.svg',
        iconAlt: 'Inflated box icon',
        title: 'Pre-Inflated in a Giant Box',
        description:
            'Open the ribbon-tied parcel and watch<br/>luxury helium balloons float upright with<br/>coordinating weights.',
        variant: 'purple',
    },
    {
        iconSrc: '/figma-img/muhjqso4-kzr5un8.svg',
        iconAlt: 'Delivery calendar icon',
        title: 'Choose Exact Delivery Date',
        description:
            'Named-day courier delivery 7 days a<br/>week, guaranteed before your party<br/>starts with live tracking.',
        variant: 'gold',
    },
    {
        iconSrc: '/figma-img/muhjqso4-iq2qip6.svg',
        iconAlt: 'Custom print icon',
        title: 'Custom Text & Photo Print',
        description:
            'Personalise with names, milestone ages,<br/>font styles, metallic foil vinyl, and<br/>handmade organza bows.',
        variant: 'purple',
    },
    {
        iconSrc: '/figma-img/muhjqso4-biuw1up.svg',
        iconAlt: 'Sustainable leaf icon',
        title: 'Sustainable Balloons',
        description:
            'Crafted from 100% natural, ethically-<br/>tapped biodegradable latex and fully<br/>recyclable party accessories.',
        variant: 'gold',
    },
];

/**
 * 4-column feature row matching the Figma `.container23` spec.
 * Alternating purple/gold card borders and icon overlay backgrounds.
 * White background band with top/bottom dividers.
 *
 * @example
 * <FigmaFeatureRow />
 */
export function FigmaFeatureRow({
    features = defaultFeatures,
    className,
    id,
}: FigmaFeatureRowProps) {
    return (
        <div
            role="region"
            aria-label="Why choose us"
            id={id}
            className={cn(
                'w-full border-y border-popjoy-divider/30 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8',
                className,
            )}
        >
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {features.map((feature, index) => (
                    <div
                        key={`${feature.title}-${index}`}
                        className={cn(
                            'flex flex-col items-start gap-1 rounded-2xl bg-popjoy-purple-bg p-5 sm:p-[23px]',
                            feature.variant === 'purple'
                                ? 'border border-popjoy-purple-surface/60'
                                : 'border',
                        )}
                        style={{
                            borderColor:
                                feature.variant === 'gold'
                                    ? 'rgba(255,223,154,0.8)'
                                    : undefined,
                        }}
                    >
                        {/* Icon overlay */}
                        <div
                            className={cn(
                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                                feature.variant === 'purple'
                                    ? 'bg-popjoy-purple-soft/10'
                                    : '',
                            )}
                            style={{
                                background:
                                    feature.variant === 'gold'
                                        ? 'rgba(253,196,37,0.2)'
                                        : undefined,
                            }}
                        >
                            <img
                                src={feature.iconSrc}
                                alt={feature.iconAlt}
                                className={cn(
                                    'shrink-0',
                                    index === 0
                                        ? 'h-5 w-5'
                                        : index === 1
                                          ? 'h-5 w-[18px]'
                                          : index === 2
                                            ? 'h-[18px] w-[19px]'
                                            : 'h-[17px] w-[17px]',
                                )}
                            />
                        </div>

                        {/* Title */}
                        <h3 className="self-stretch pt-3 font-plus-jakarta text-base leading-6 font-bold text-popjoy-ink">
                            {feature.title}
                        </h3>

                        {/* Description — removed fixed w-[273px] so text wraps
                             inside fluid card widths on mobile/tablet */}
                        <p
                            className="self-stretch font-sans text-xs leading-5 text-popjoy-muted"
                            dangerouslySetInnerHTML={{
                                __html: feature.description,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
