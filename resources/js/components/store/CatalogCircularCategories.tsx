import { cn } from '@/lib/utils';

/**
 * Single circular category tile.
 * Outer ring style can be a gradient (default for first tile),
 * a plain purple background, or a gold ring.
 */
export type CatalogCircularCategory = {
    /** Bold title below the circle */
    title: string;
    /** Secondary subtitle/muted text below the title */
    subtitle: string;
    /** Image path inside the 72px circle (relative to /figma-img/) */
    imageSrc: string;
    /** Optional target link */
    href?: string;
    /**
     * Outer ring style:
     *  - `gradient` → purple→gold gradient border (Personalised Bubbles)
     *  - `purple` → plain popjoy-purple-surface ring (default)
     */
    ringStyle?: 'gradient' | 'purple';
    /** Alt text for the category image */
    imageAlt?: string;
};

/**
 * Props for the CatalogCircularCategories component.
 * Matches Figma `.sectionCircularCateg`: heading row with purple dot + title + hint,
 * then a horizontal scroll row of 7 circular cards (112 wide, 72px inner circle).
 */
export type CatalogCircularCategoriesProps = {
    /** Heading for the section (default "Explore Balloon Styles") */
    heading?: string;
    /** Swipe/browse hint text on the right of the heading */
    swipeHint?: string;
    /**
     * Array of 7 circular category tiles.
     * Falls back to the default balloon-style categories.
     */
    categories?: CatalogCircularCategory[];
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the section */
    id?: string;
};

const defaultCategories: CatalogCircularCategory[] = [
    {
        title: 'Personalised Bubbles',
        subtitle: 'From £34.99',
        imageSrc: '/figma-img/mui8bfq8-zskixl3.png',
        ringStyle: 'gradient',
        imageAlt: 'Personalised bubble balloons',
    },
    {
        title: 'Milestone Numbers',
        subtitle: 'Ages 1-100',
        imageSrc: '/figma-img/mui8bfq8-h10ii7a.png',
        imageAlt: 'Milestone number balloons',
    },
    {
        title: 'Giant Tassel Orbs',
        subtitle: '3ft Spheres',
        imageSrc: '/figma-img/mui8bfq8-rluql1q.png',
        imageAlt: 'Giant tassel orb balloons',
    },
    {
        title: 'Balloon Arches',
        subtitle: 'Freestanding Installs',
        imageSrc: '/figma-img/mui8bfq8-cl90fx1.png',
        imageAlt: 'Balloon arch installations',
    },
    {
        title: 'Party Themes',
        subtitle: 'Safari, Space & Disco',
        imageSrc: '/figma-img/mui8bfq8-x141td4.png',
        imageAlt: 'Party themed balloons',
    },
    {
        title: 'Baby Showers',
        subtitle: 'Gender Reveals & Soft Sets',
        imageSrc: '/figma-img/mui8bfq8-e9dhtsw.png',
        imageAlt: 'Baby shower balloon sets',
    },
    {
        title: 'Helium & DIY Kits',
        subtitle: 'Easy Home Kits',
        imageSrc: '/figma-img/mui8bfq8-t3j36qn.png',
        imageAlt: 'Helium and DIY balloon kits',
    },
];

/**
 * Horizontal circular category scroller matching Figma `.sectionCircularCateg`.
 *
 * Heading row: 10px popjoy-purple-soft dot + 24px/Plus-Jakarta w600 title +
 * right-side 11px/4A4455 "Swipe to browse all 7 curated aesthetics" hint.
 *
 * 7 horizontal cards (112 wide): 72px circle image with white inner + shadow,
 * outer ring either purple→gold gradient (first tile) or popjoy-purple-surface.
 * Below each circle: bold title (Inter 12px/16 w700 popjoy-ink) + muted subtitle.
 *
 * @example
 * <CatalogCircularCategories />
 */
export function CatalogCircularCategories({
    heading = 'Explore Balloon Styles',
    swipeHint = 'Swipe to browse all 7 curated aesthetics',
    categories = defaultCategories,
    className,
    id,
}: CatalogCircularCategoriesProps) {
    const headingId = `${id ?? 'circular-categories'}-heading`;

    return (
        <section
            id={id}
            role="region"
            aria-labelledby={headingId}
            className={cn(
                'flex w-full flex-col items-start self-stretch px-10 py-3',
                className,
            )}
            style={{ gap: '12px', maxWidth: '1280px' }}
        >
            <div className="flex w-full shrink-0 items-center justify-between self-stretch">
                <div className="inline-flex shrink-0 items-center gap-1">
                    <div className="h-[10px] w-[10px] shrink-0 rounded-full bg-popjoy-purple-soft" />
                    <h2
                        id={headingId}
                        className="font-plus-jakarta text-[24px] leading-6 font-semibold text-popjoy-ink"
                    >
                        {heading}
                    </h2>
                </div>
                <p className="font-sans text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                    {swipeHint}
                </p>
            </div>

            <div
                className="flex w-full shrink-0 items-start self-stretch overflow-auto pt-1 pb-3"
                style={{ columnGap: '16px' }}
            >
                {categories.map((cat, index) => (
                    <a
                        key={`${cat.title}-${index}`}
                        href={cat.href ?? '#'}
                        className="flex w-[112px] shrink-0 flex-col items-center"
                    >
                        <div
                            className={cn(
                                'mx-4 flex shrink-0 items-center self-stretch rounded-full',
                                cat.ringStyle === 'gradient'
                                    ? ''
                                    : 'bg-popjoy-purple-surface',
                            )}
                            style={
                                cat.ringStyle === 'gradient'
                                    ? {
                                          backgroundImage:
                                              'linear-gradient(45deg, #630ED4 0%, #FDC425 100%)',
                                      }
                                    : undefined
                            }
                        >
                            <div
                                className="flex flex-1 items-center rounded-full p-1"
                                style={{
                                    boxShadow:
                                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.004)',
                                }}
                            >
                                <div className="flex h-[72px] w-[72px] flex-1 flex-col items-start justify-center self-stretch overflow-hidden rounded-full bg-white">
                                    <img
                                        src={cat.imageSrc}
                                        alt={cat.imageAlt ?? ''}
                                        aria-hidden={!cat.imageAlt}
                                        className="h-[72px] w-[72px] flex-1 self-stretch overflow-hidden object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-1">
                            <span className="font-sans text-xs leading-4 font-bold tracking-[0.24px] text-popjoy-ink">
                                {cat.title}
                            </span>
                        </div>
                        <span className="font-sans text-[11px] leading-[14px] font-medium tracking-[0.33px] text-popjoy-muted">
                            {cat.subtitle}
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
}
