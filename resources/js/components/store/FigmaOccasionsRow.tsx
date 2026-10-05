import { Link } from '@inertiajs/react';
import { ArrowRight, PartyPopper } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Occasion fields sent by the storefront home controller.
 */
export type FigmaOccasionCard = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
};

/**
 * Props for the FigmaOccasionsRow component.
 */
export type FigmaOccasionsRowProps = {
    occasions: FigmaOccasionCard[];
    className?: string;
    id?: string;
};

/**
 * "Shop by Occasion" section — image-forward portrait cards for the featured
 * occasions. Deliberately distinct from the circular-avatar category grid:
 * full-bleed photography with a bottom gradient wash so the occasion name sits
 * legibly over any image. Cards without a photo fall back to a pastel gradient
 * tile with a celebration icon.
 */
export function FigmaOccasionsRow({
    occasions,
    className,
    id,
}: FigmaOccasionsRowProps) {
    return (
        <section
            id={id}
            aria-label="Shop by occasion"
            className={cn(
                'w-full bg-popjoy-bg px-5 py-16 sm:px-8 lg:px-12 lg:py-20',
                className,
            )}
        >
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                            SHOP BY OCCASION
                        </span>
                        <h2 className="font-plus-jakarta text-3xl leading-9 font-bold text-popjoy-ink">
                            Find Your Reason to Celebrate
                        </h2>
                    </div>
                    <Link
                        href="/occasions"
                        className="inline-flex items-center gap-1 text-sm font-bold text-popjoy-purple transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-popjoy-purple"
                    >
                        View all occasions
                        <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0"
                        />
                    </Link>
                </div>

                {occasions.length === 0 ? (
                    <p className="rounded-2xl border border-popjoy-divider/50 bg-white px-6 py-10 text-center text-sm text-popjoy-muted">
                        Occasions are being prepared. Please check back soon.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
                        {occasions.map((occasion) => (
                            <Link
                                key={occasion.id}
                                href={`/occasions/${occasion.slug}`}
                                className="group relative block aspect-4/5 overflow-hidden rounded-3xl border border-popjoy-divider/50 bg-popjoy-purple-bg transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-popjoy-purple"
                            >
                                {occasion.image ? (
                                    <img
                                        src={occasion.image}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #eaddff 0%, #ffdf9a 100%)',
                                        }}
                                    >
                                        <PartyPopper className="size-10 text-popjoy-purple/60" />
                                    </span>
                                )}

                                {/* Bottom gradient wash keeps the label legible */}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 bottom-0 h-2/5"
                                    style={{
                                        background:
                                            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)',
                                    }}
                                />

                                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4">
                                    <span className="font-plus-jakarta text-base leading-6 font-bold text-white drop-shadow-sm">
                                        {occasion.name}
                                    </span>
                                    {occasion.description ? (
                                        <span className="line-clamp-2 text-[11px] leading-4 text-white/85">
                                            {occasion.description}
                                        </span>
                                    ) : null}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
