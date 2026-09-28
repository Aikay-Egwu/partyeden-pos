import { cn } from '@/lib/utils';

/**
 * Single FAQ question.
 */
export type FigmaProductFaqItem = {
    /** Question text */
    question: string;
    /** Optional icon source; chevron is always rendered on the right */
    iconSrc?: string;
};

/**
 * Props for the FigmaProductFaq component.
 * Matches Figma `.sectionProductSpecif` with soft lilac background:
 * "GOT QUESTIONS?" eyebrow, big "Frequently Asked Balloon Questions"
 * heading, and three FAQ accordion items stacked with chevron toggles.
 */
export type FigmaProductFaqProps = {
    /** Section eyebrow, e.g. "GOT QUESTIONS?" */
    eyebrow?: string;
    /** Main heading */
    title?: string;
    /** Three FAQ items */
    items?: FigmaProductFaqItem[];
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultItems: FigmaProductFaqItem[] = [
    { question: 'Do I need to hire or buy a helium canister?' },
    { question: 'How far in advance can I order my balloon?' },
    { question: 'What happens if the balloon pops during courier transit?' },
];

/**
 * Bottom FAQ section matching the Figma product page. Renders on a
 * soft lilac (popjoy-purple-bg) full-width band with the three most
 * common balloon questions. Each item is an unexpanded accordion row.
 *
 * @example
 * <FigmaProductFaq
 *   eyebrow="GOT QUESTIONS?"
 *   title="Frequently Asked Balloon Questions"
 * />
 */
export function FigmaProductFaq({
    eyebrow = 'GOT QUESTIONS?',
    title = 'Frequently Asked Balloon Questions',
    items = defaultItems,
    className,
    id,
}: FigmaProductFaqProps) {
    return (
        <section
            id={id}
            className={cn(
                'relative flex w-full flex-col items-center gap-6 py-16',
                className,
            )}
            style={{
                background:
                    'linear-gradient(180deg, #f9f1ff 0%, #f4eaff 50%, #fef7ff 100%)',
            }}
            aria-labelledby="product-faq-heading"
        >
            <div
                className="flex w-full flex-col items-start gap-6 px-10"
                style={{ maxWidth: '1280px' }}
            >
                <div className="flex flex-col items-start gap-3">
                    <p className="text-[12px] leading-4 font-bold tracking-[0.6px] text-popjoy-purple uppercase">
                        {eyebrow}
                    </p>
                    <h2
                        id="product-faq-heading"
                        className="font-plus-jakarta text-[36px] leading-[44px] font-bold tracking-[-1px] text-popjoy-ink"
                    >
                        {title}
                    </h2>
                </div>

                <div className="flex w-full max-w-[960px] flex-col items-start gap-3">
                    {items.map((item, i) => (
                        <button
                            key={`faq-${i}`}
                            type="button"
                            aria-expanded="false"
                            className={cn(
                                'flex w-full items-center justify-between gap-3 rounded-3xl border px-6 py-5 text-left transition hover:border-popjoy-purple-surface',
                                i === items.length - 1
                                    ? 'border-popjoy-gold-border/70 bg-popjoy-gold/5'
                                    : 'border-popjoy-divider/40 bg-white',
                            )}
                            style={{
                                boxShadow:
                                    '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -2px rgba(0,0,0,0.05)',
                            }}
                        >
                            <p className="font-plus-jakarta text-[18px] leading-6 font-semibold tracking-[0.14px] text-popjoy-ink">
                                {item.question}
                            </p>
                            <img
                                src="/figma-img/mui8gto1-doxv9wj.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-[9px] w-[14px] shrink-0"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
