import { ArrowUpRight, CalendarHeart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FigmaCelebrationServicesProps = {
    className?: string;
    id?: string;
};

const celebrationTypes = [
    'Kids & Adult Birthdays',
    'Luxury Weddings',
    'Milestone Anniversaries',
    'Corporate & Brand Galas',
];

/**
 * Full-width luxury banner advertising bespoke full-scale event planning & styling via Kaito Events.
 * Tagline: "Do you want to celebrate bigger?"
 * Link: https://kaitoevents.co.uk/contact
 */
export function FigmaCelebrationServices({
    className,
    id = 'celebrate-bigger',
}: FigmaCelebrationServicesProps) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className={cn(
                'w-full bg-popjoy-bg px-5 py-8 sm:px-8 sm:py-12 lg:px-12',
                className,
            )}
        >
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-popjoy-purple/20 bg-gradient-to-br from-[#2a0845] via-[#47126b] to-[#630ed4] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
                {/* Decorative background glow circles */}
                <div
                    className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-popjoy-gold/20 blur-[80px]"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-popjoy-purple-soft/30 blur-[80px]"
                    aria-hidden="true"
                />

                <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                    {/* Left text column */}
                    <div className="flex max-w-2xl flex-col items-start gap-4">
                        {/* Eyebrow badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-popjoy-gold" />
                            <span className="font-sans text-xs font-bold tracking-[1.2px] text-popjoy-gold uppercase">
                                BESPOKE EVENT PLANNING &amp; STYLING
                            </span>
                        </div>

                        {/* Tagline */}
                        <h2
                            id={`${id}-heading`}
                            className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                        >
                            Do you want to celebrate bigger?
                        </h2>

                        {/* Description */}
                        <p className="font-sans text-base leading-relaxed text-white/85 sm:text-lg">
                            For kids and adult birthdays, weddings, anniversaries:{' '}
                            <span className="font-semibold text-popjoy-gold">
                                Let us talk.
                            </span>{' '}
                            From immersive thematic styling to full-scale event production, our sister brand Kaito Events brings extraordinary visions to life.
                        </p>

                        {/* Occasion tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {celebrationTypes.map((type) => (
                                <span
                                    key={type}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-sans text-xs font-medium text-white/90 backdrop-blur-sm"
                                >
                                    <CalendarHeart className="h-3 w-3 text-popjoy-gold" />
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right CTA button */}
                    <div className="flex w-full flex-col sm:w-auto sm:shrink-0">
                        <a
                            href="https://kaitoevents.co.uk/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center justify-center gap-3 rounded-full bg-popjoy-gold px-8 py-4.5 font-plus-jakarta text-base font-bold text-popjoy-gold-ink shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#ffe17d] hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-popjoy-purple focus-visible:outline-none"
                        >
                            <span>Let&apos;s Plan Your Event</span>
                            <ArrowUpRight
                                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                aria-hidden="true"
                            />
                        </a>
                        <span className="mt-2 text-center font-sans text-xs text-white/60">
                            Visit kaitoevents.co.uk
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
