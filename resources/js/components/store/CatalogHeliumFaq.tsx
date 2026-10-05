import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Single FAQ accordion item definition.
 * Each FAQ has a question string, HTML-safe answer string,
 * and an optional defaultOpen flag to start the accordion expanded.
 */
export type CatalogHeliumFaqItem = {
    /** FAQ question text */
    question: string;
    /** FAQ answer — supports HTML via dangerouslySetInnerHTML */
    answerHtml: string;
    /** If true, the accordion starts expanded by default */
    defaultOpen?: boolean;
};

/**
 * Props for the CatalogHeliumFaq component.
 * Matches Figma `.sectionHeliumCareDel` spec:
 * purple-surface rounded-48 container with centered header
 * (uppercase eyebrow, h2, copy) followed by 5 stacked FAQ accordions
 * (first expanded by default) with chevron indicator.
 */
export type CatalogHeliumFaqProps = {
    /** Uppercase eyebrow label above h2 */
    eyebrow?: string;
    /** Main h2 headline */
    headline?: string;
    /** Supporting description paragraph below h2 */
    description?: string;
    /** Chevron icon used for closed (and rotated for open) accordions */
    chevronIconSrc?: string;
    /** 5 FAQ items — first defaults to OPEN per Figma spec */
    faqs?: CatalogHeliumFaqItem[];
    /** Optional additional className for the outer section */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultFaqs: CatalogHeliumFaqItem[] = [
    {
        question:
            'How long will my inflated balloons actually float inside the giant box?',
        answerHtml:
            '<span style="color:#201637">Crystal Bubble balloons arrive in our 40cm tall gift boxes with the ribbon pre-weighted. We use medical-grade helium with a high-float polymer sealant inside the latex. Float times:&nbsp;</span>' +
            '<span style="color:#630ED4;font-weight:700">24" Crystal Bubble = 10–14 days</span>' +
            '<span style="color:#201637">;&nbsp;</span>' +
            '<span style="color:#630ED4;font-weight:700">Giant 3ft Orbs = 7–9 days</span>' +
            '<span style="color:#201637">;&nbsp;</span>' +
            '<span style="color:#630ED4;font-weight:700">Latex clusters = 5–7 days</span>' +
            '<span style="color:#201637">;&nbsp;</span>' +
            '<span style="color:#630ED4;font-weight:700">Foil numbers = 4 weeks+</span>' +
            '<span style="color:#201637">.</span>',
        defaultOpen: true,
    },
    {
        question:
            'Can I schedule a delivery for a specific 1hr window on the weekend?',
        answerHtml:
            '<span style="color:#4A4455">Yes. At checkout you select your exact celebration date and a morning (before 1pm) or afternoon 1hr courier slot. DPD sends live tracking text messages 1hr before arrival, so you never miss the handoff. Weekend and Bank Holiday slots are available at a small premium and book up 2–3 weeks in advance around Mother\'s Day, Valentine\'s, and Christmas party season.</span>',
    },
    {
        question: 'What happens if my balloons arrive damaged or deflated?',
        answerHtml:
            '<span style="color:#4A4455">We photograph every order before boxing and every shipment is fully insured by DPD. If anything arrives damaged, deflated, or not as pictured, snap a quick unboxing photo and WhatsApp our Bristol studio within 2 hours of delivery. Under our Float Guarantee we will send a full replacement at no charge the very next day or issue a 110% refund — no forms, no arguments, no hoops.</span>',
    },
    {
        question:
            'Do you ship balloons directly as surprise gifts with no pricing?',
        answerHtml:
            '<span style="color:#4A4455">Absolutely — 70% of our orders ship straight to a surprise recipient! Every giant gift box has no invoice, no price labels, and no pricing anywhere inside or out. Add your free handwritten gift note at checkout and we\'ll even print it in our cursive gold script so it looks totally handwritten. Recipients open the lid and balloons float straight up — pure wow moment.</span>',
    },
    {
        question: 'Are balloon disposals and packaging eco-friendly?',
        answerHtml:
            '<span style="color:#4A4455">Yes. Every latex balloon we use is 100% FSC-certified biodegradable natural rubber — breaks down at the same rate as an oak leaf. Our giant gift boxes are fully curbside recyclable cardboard, inner tissue paper is acid-free and FSC recycled, and satin ribbons can be saved and re-used for wrapping. Print our free Eco Disposal Card we include in every box — full instructions inside.</span>',
    },
];

/**
 * Helium delivery & float times FAQ accordion section matching the
 * Figma `.sectionHeliumCareDel` spec.
 *
 * Layout:
 *   - Outer container: rounded-48 popjoy-purple-surface background with
 *     centered header content (eyebrow → h2 → copy) — max width constrained.
 *   - Header: uppercase purple 12px/w700 eyebrow "FREQUENTLY ASKED QUESTIONS",
 *     32px Plus-Jakarta bold h2 "Helium Delivery & Float Times",
 *     centered muted description about insured UK shipping + longevity guarantee.
 *   - FAQ list: 5 rounded-3xl white accordion pills stacked vertically.
 *     The first item is OPEN by default showing the Crystal Bubble float answer
 *     with bolded purple product names. Closed items show a chevron-down icon.
 *
 * @example
 * <CatalogHeliumFaq />
 */
export function CatalogHeliumFaq({
    eyebrow = 'FREQUENTLY ASKED QUESTIONS',
    headline = 'Helium Delivery & Float Times',
    description = 'Everything you need to know about our insured UK balloon shipping, float longevity guarantee, and gift unboxing.',
    chevronIconSrc = '/figma-img/mui8bfpc-adkweuq.svg',
    faqs = defaultFaqs,
    className,
    id,
}: CatalogHeliumFaqProps) {
    const headingId = id ? `${id}-heading` : 'helium-faq-heading';
    const sectionId = id ? `${id}-section` : 'helium-faq-section';
    const [openFaqs, setOpenFaqs] = useState<Set<number>>(
        () =>
            new Set(
                faqs
                    .map((f, i) => (f.defaultOpen ? i : -1))
                    .filter((i) => i >= 0),
            ),
    );

    const toggleFaq = (index: number) => {
        setOpenFaqs((prev) => {
            const next = new Set(prev);

            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }

            return next;
        });
    };

    return (
        <section
            id={sectionId}
            aria-labelledby={headingId}
            className={cn(
                'mx-auto flex w-full max-w-[1280px] flex-col items-start px-10 pb-16',
                className,
            )}
        >
            {/* Rounded-48 purple surface card */}
            <div
                className="flex w-full shrink-0 flex-col items-center self-stretch rounded-[48px] p-10"
                style={{
                    background: '#F4EAFF',
                    rowGap: '24px',
                }}
            >
                {/* ====== Centered header ====== */}
                <div
                    className="flex shrink-0 flex-col items-center self-stretch pt-[6px]"
                    style={{
                        rowGap: '4px',
                        marginLeft: '272px',
                        marginRight: '272px',
                    }}
                >
                    {/* Uppercase eyebrow */}
                    <span
                        className="shrink-0 self-stretch font-sans font-bold text-popjoy-purple uppercase"
                        style={{
                            fontSize: '12px',
                            lineHeight: '16px',
                            letterSpacing: '1.2px',
                        }}
                    >
                        {eyebrow}
                    </span>

                    {/* H2: 32px Plus-Jakarta w700 */}
                    <h2
                        id={headingId}
                        className="shrink-0 self-stretch pt-[3px] text-center font-plus-jakarta font-bold text-popjoy-ink"
                        style={{
                            fontSize: '32px',
                            lineHeight: '40px',
                            letterSpacing: '-0.64px',
                        }}
                    >
                        {headline}
                    </h2>

                    {/* Description copy */}
                    <div className="flex shrink-0 flex-col items-center self-stretch">
                        <p
                            className="shrink-0 text-center font-sans text-popjoy-muted"
                            style={{
                                width: '522px',
                                fontSize: '15px',
                                lineHeight: '22px',
                                letterSpacing: '0',
                            }}
                        >
                            {description}
                        </p>
                    </div>
                </div>

                {/* ====== 5 FAQ accordions ====== */}
                <div
                    className="flex shrink-0 flex-col items-start self-stretch"
                    style={{
                        rowGap: '8px',
                        marginLeft: '176px',
                        marginRight: '176px',
                    }}
                >
                    {faqs.map((faq, fIdx) => {
                        const isOpen = openFaqs.has(fIdx);

                        return (
                            <div
                                key={`helium-faq-${fIdx}`}
                                className={cn(
                                    'flex w-full shrink-0 items-center justify-between rounded-[32px] px-4 transition-colors',
                                    isOpen ? 'flex-col items-start' : '',
                                )}
                                style={{
                                    padding: isOpen ? '16px' : '16px',
                                    boxShadow:
                                        '0px 1px 2px 0px rgba(0,0,0,0.05)',
                                    background: '#FFFFFF',
                                    rowGap: isOpen ? '12px' : undefined,
                                }}
                            >
                                {/* Summary / question row with chevron */}
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(fIdx)}
                                    aria-expanded={isOpen}
                                    aria-controls={`helium-faq-panel-${fIdx}`}
                                    className="flex w-full shrink-0 items-center justify-between self-stretch text-left"
                                >
                                    <span
                                        className="flex-1 pr-4 font-plus-jakarta font-semibold text-popjoy-ink"
                                        style={{
                                            fontSize: '18px',
                                            lineHeight: '24px',
                                        }}
                                    >
                                        {faq.question}
                                    </span>
                                    <div
                                        className={cn(
                                            'flex shrink-0 items-center justify-center transition-transform',
                                            isOpen ? 'rotate-180' : '',
                                        )}
                                    >
                                        <img
                                            src={chevronIconSrc}
                                            alt=""
                                            aria-hidden="true"
                                            className="shrink-0"
                                            style={{
                                                width: '10px',
                                                height: '6px',
                                            }}
                                        />
                                    </div>
                                </button>

                                {/* Answer panel (when open) */}
                                {isOpen && (
                                    <div
                                        id={`helium-faq-panel-${fIdx}`}
                                        role="region"
                                        className="self-stretch font-sans"
                                        style={{
                                            fontSize: '15px',
                                            lineHeight: '22px',
                                            letterSpacing: '0',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: faq.answerHtml,
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
