import { cn } from '@/lib/utils';

/**
 * Props for the FigmaAnnouncementBar component.
 * Renders a thin purple top announcement bar with balloon emoji and delivery promises.
 */
export type FigmaAnnouncementBarProps = {
    /** Optional additional className for the outer bar container */
    className?: string;
    /** Optional id attribute for the outer bar container */
    id?: string;
};

/**
 * Top announcement bar matching the Figma `.topAnnouncementBar` spec.
 * Purple background (#630ed4), balloon emoji, and three-part delivery promise text.
 *
 * @example
 * <FigmaAnnouncementBar />
 */
export function FigmaAnnouncementBar({
    className,
    id,
}: FigmaAnnouncementBarProps) {
    return (
        <div
            role="region"
            aria-label="Delivery announcement"
            id={id}
            className={cn(
                'flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-popjoy-purple px-3 py-2 text-center sm:px-4',
                className,
            )}
        >
            <span
                role="img"
                aria-label="balloon"
                className="shrink-0 text-sm leading-4 font-bold tracking-[0.3px] text-white"
            >
                🎈
            </span>
            <p className="font-sans text-[11px] leading-4 font-semibold tracking-[0.3px] text-white sm:text-xs">
                GUARANTEED PARTY ARRIVAL: Choose your delivery date at checkout
                · 7 Days A Week Named-Day UK Delivery
            </p>
            <p className="hidden font-sans text-[11px] leading-4 font-semibold tracking-[0.3px] text-white sm:block sm:text-xs">
                · Free luxury ribbon &amp; weight included on orders over £50
            </p>
        </div>
    );
}
