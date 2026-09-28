import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Single customer review card definition used in the reviews column.
 * Includes avatar initials, name, location/verification, star rating,
 * unboxing photo image, testimonial quote, and purchased product line items.
 */
export type FigmaReview = {
    /** Two-letter initials shown in the avatar circle */
    initials: string;
    /** Reviewer full name, e.g. "Emma M." */
    name: string;
    /** Location + verification label, e.g. "Guildford · Verified Party Host" */
    meta: string;
    /** Source path of the unboxing/review image */
    imageSrc: string;
    /** Alt text for the review image */
    imageAlt: string;
    /** Customer testimonial quote (may contain <br/>) */
    quote: string;
    /** One or two line items describing what was purchased */
    purchased: string[];
};

/**
 * Single FAQ accordion item definition.
 * Each FAQ has a question string and a HTML-safe answer string that may
 * contain styled spans (e.g. bolded product names).
 */
export type FigmaFaqItem = {
    /** FAQ question text */
    question: string;
    /** FAQ answer — supports HTML (e.g. <span> styling) via dangerouslySetInnerHTML */
    answerHtml: string;
    /** Whether the accordion starts open by default */
    defaultOpen?: boolean;
};

/**
 * Props for the FigmaReviewsFaq component.
 * Matches Figma `.autoWrapper7` split layout:
 * left side reviews column with 3 testimonial cards,
 * right side FAQ column with 4 accordion items.
 */
export type FigmaReviewsFaqProps = {
    /** Optional custom reviews array — falls back to the 3 default Party Eden reviews. */
    reviews?: FigmaReview[];
    /** Optional custom FAQ items — falls back to the 4 default helium/delivery FAQs. */
    faqs?: FigmaFaqItem[];
    /** Optional chevron-down icon used on closed FAQ accordions */
    chevronIconSrc?: string;
    /** Optional chevron-up icon used on the opened FAQ accordion */
    chevronUpIconSrc?: string;
    /** Optional additional className for the outer wrapper */
    className?: string;
    /** Optional id attribute for the outer section */
    id?: string;
};

const defaultReviews: FigmaReview[] = [
    {
        initials: 'EM',
        name: 'Emma M.',
        meta: 'Guildford · Verified Party Host',
        imageSrc: '/figma-img/muhjqsol-ce9ogdm.png',
        imageAlt: 'Unboxing moment with personalised crystal bubble balloon',
        quote: '"Opened the box and it floated right out! My daughter was<br/>completely mesmerized. The vinyl lettering was crisp<br/>metallic gold and they stayed floating for nearly two full<br/>weeks!"',
        purchased: [
            'Purchased: Personalised Crystal Bubble',
            'Sunday Delivery',
        ],
    },
    {
        initials: 'DL',
        name: 'David L.',
        meta: 'Manchester · Verified Buyer',
        imageSrc: '/figma-img/muhjqsol-0spzsml.png',
        imageAlt: '30th milestone number balloon stack at a dinner party',
        quote: '"Ordered for my wife\'s 30th dinner. Came at 9:30 AM on a<br/>Saturday morning exactly when promised. Zero stress, no<br/>blowing up balloons with tanks yourself. 10/10 service."',
        purchased: ['Purchased: 30th Milestone Stack', 'Saturday Slot'],
    },
    {
        initials: 'CR',
        name: 'Chloe R.',
        meta: 'Bristol · Baby Shower Planner',
        imageSrc: '/figma-img/muhjqsol-l6ccdyp.png',
        imageAlt: 'Gender reveal confetti balloon pop at a baby shower',
        quote: '"We sent the gender results privately and the Party Eden<br/>team built our secret pop balloon perfectly. The pop<br/>moment was unforgettable and confetti filled the room with<br/>joy!"',
        purchased: ['Purchased: Mystery Gender Reveal', 'Fragile Boxed'],
    },
];

const defaultFaqs: FigmaFaqItem[] = [
    {
        question: 'How long will my inflated balloons float?',
        answerHtml:
            '<span style="color:#201637">Our&nbsp;</span>' +
            '<span style="color:#630ed4;font-weight:700">Crystal Bubble Balloons</span>' +
            '<span style="color:#201637">&nbsp;float for 10 to 14 days guaranteed! Foil numbers and shapes float gracefully for 5 to 7 days, and latex balloons<br/>treated with our eco-friendly Ultra Hi-Float gel last 48 to 72 hours. We always recommend scheduling delivery on the day of or the day<br/>prior to your event.</span>',
        defaultOpen: true,
    },
    {
        question: 'Can I send balloons directly as a surprise gift?',
        answerHtml:
            '<span style="color:#4a4455">Absolutely! Every order ships in a discreet, beautifully tied giant gift box with no pricing on the label. Add a free handwritten gift note at checkout and we\'ll ship it directly to the recipient — the first thing they\'ll see is balloons floating out and a big smile.</span>',
    },
    {
        question: 'What actually arrives in the box?',
        answerHtml:
            '<span style="color:#4a4455">Your fully inflated helium balloon bouquet, anchored with a matching decorative weight, tied with luxury satin ribbon, and a free handwritten gift card. Crystal bubbles come in a protective outer sleeve, and garland/DIY kits include step-by-step photo instructions, a balloon pump, and glue dots — everything you need.</span>',
    },
    {
        question: 'Do you deliver on Saturdays and Sundays?',
        answerHtml:
            '<span style="color:#4a4455">Yes — 7 days a week, named-day delivery via DPD. You pick the exact date at checkout. Saturday and Sunday slots are priced slightly higher and book up fast, especially around bank holidays and Valentine\'s / Mother\'s Day.</span>',
    },
];

/**
 * Combined Reviews + FAQ section matching the Figma `.autoWrapper7` spec.
 * Two-column split layout:
 * - LEFT column (`container75`): Reviews eyebrow + heading, 5-star Trustpilot rating,
 *   3 review cards stacked vertically (avatar, stars, photo, quote, purchased items).
 * - RIGHT column (`container80`): FAQ eyebrow + heading, 4-accordion FAQ list,
 *   first accordion open by default showing the Crystal Bubble float answer,
 *   remaining 3 accordions closed with a chevron-down indicator.
 *
 * @example
 * <FigmaReviewsFaq />
 */
export function FigmaReviewsFaq({
    reviews = defaultReviews,
    faqs = defaultFaqs,
    chevronIconSrc = '/figma-img/muhjqso4-jta1ksm.svg',
    chevronUpIconSrc = '/figma-img/muhjqso4-kn9amkf.svg',
    className,
    id,
}: FigmaReviewsFaqProps) {
    const headingId = id ? `${id}-heading` : 'reviews-faq-heading';
    const faqHeadingId = id ? `${id}-faq-heading` : 'faq-heading';
    const sectionId = id ? `${id}-section` : 'reviews-faq-section';
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
                'w-full bg-popjoy-bg px-4 py-12 sm:px-6 sm:py-16 lg:px-8',
                className,
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-10 lg:flex-row">
                {/* ========== LEFT: Reviews column ========== */}
                <div className="flex w-full max-w-[640px] flex-1 flex-col items-start gap-8">
                    {/* Reviews header: stack on mobile, row on sm */}
                    <div className="flex w-full shrink-0 flex-col items-start justify-between gap-4 self-stretch sm:flex-row sm:items-start sm:gap-4">
                        <div className="flex flex-col items-start gap-3">
                            <span className="font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                                REAL PARTIES, REAL JOY
                            </span>
                            <h2
                                id={headingId}
                                className="font-plus-jakarta leading-tight font-bold text-popjoy-ink"
                                style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
                                    lineHeight: 1.27,
                                }}
                            >
                                Unboxing Magic Across The UK
                            </h2>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span
                                className="text-sm leading-4 text-popjoy-star"
                                aria-hidden="true"
                            >
                                ★★★★★
                            </span>
                            <span className="font-plus-jakarta text-sm leading-5 font-bold text-popjoy-ink">
                                4.9 Star Rating on Trustpilot
                            </span>
                        </div>
                    </div>

                    {/* 3 review cards stack */}
                    <div className="flex shrink-0 flex-col items-start gap-6 self-stretch">
                        {reviews.map((review, rIndex) => (
                            <article
                                key={`${review.name}-${rIndex}`}
                                className="flex shrink-0 flex-col items-start gap-5 self-stretch rounded-3xl border border-popjoy-divider/40 bg-white p-5 shadow-[0px_4px_16px_-4px_rgba(32,22,55,0.08)] sm:p-6"
                            >
                                <div className="flex flex-col items-start gap-4 self-stretch">
                                    {/* Avatar row + star rating: allow wrap */}
                                    <div className="flex w-full shrink-0 flex-col items-start justify-between gap-3 self-stretch sm:flex-row sm:items-center sm:gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-popjoy-purple-surface">
                                                <span className="font-plus-jakarta text-sm leading-5 font-bold text-popjoy-purple">
                                                    {review.initials}
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-col items-start">
                                                <span className="font-plus-jakarta text-sm leading-5 font-bold text-popjoy-ink">
                                                    {review.name}
                                                </span>
                                                <span className="truncate font-sans text-xs leading-4 text-popjoy-muted">
                                                    {review.meta}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className="text-sm leading-4 text-popjoy-star"
                                            aria-hidden="true"
                                        >
                                            ★★★★★
                                        </span>
                                    </div>

                                    {/* Unboxing photo */}
                                    <div className="flex h-[180px] shrink-0 items-center self-stretch overflow-hidden rounded-2xl bg-popjoy-purple-bg">
                                        <img
                                            src={review.imageSrc}
                                            alt={review.imageAlt}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Quote */}
                                    <p
                                        className="self-stretch font-sans text-sm leading-6 text-popjoy-ink"
                                        dangerouslySetInnerHTML={{
                                            __html: review.quote,
                                        }}
                                    />
                                </div>

                                {/* Purchased items divider + labels */}
                                <div className="flex shrink-0 items-start self-stretch">
                                    <div className="flex flex-col items-start gap-1 self-stretch border-t border-popjoy-divider/40 pt-4">
                                        {review.purchased.map((item, pIndex) => (
                                            <span
                                                key={`${review.initials}-p-${pIndex}`}
                                                className="font-sans text-xs leading-4 font-bold text-popjoy-purple"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* ========== RIGHT: FAQ column ========== */}
                <div
                    className="flex w-full flex-col items-start gap-8 lg:w-[560px] lg:max-w-[560px] lg:shrink-0"
                    aria-labelledby={faqHeadingId}
                >
                    {/* FAQ header */}
                    <div className="flex flex-col items-start gap-3 self-stretch">
                        <span className="font-sans text-xs leading-4 font-bold tracking-[1.2px] text-popjoy-purple uppercase">
                            GOT QUESTIONS?
                        </span>
                        <h2
                            id={faqHeadingId}
                            className="font-plus-jakarta leading-tight font-bold text-popjoy-ink"
                            style={{
                                fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
                                lineHeight: 1.27,
                            }}
                        >
                            Helium Care &amp; Delivery FAQ
                        </h2>
                    </div>

                    {/* FAQ accordions */}
                    <div className="flex shrink-0 flex-col items-start gap-4 self-stretch">
                        {faqs.map((faq, fIndex) => {
                            const isOpen = openFaqs.has(fIndex);

                            return (
                                <div
                                    key={`faq-${fIndex}`}
                                    className={cn(
                                        'flex shrink-0 flex-col items-start gap-4 self-stretch rounded-2xl border p-5 transition-colors sm:p-6',
                                        isOpen
                                            ? 'border-popjoy-purple-surface bg-popjoy-purple-bg/40'
                                            : 'border-popjoy-divider/40 bg-white',
                                    )}
                                >
                                    {/* Summary / question row */}
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(fIndex)}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-panel-${fIndex}`}
                                        className="flex shrink-0 items-center justify-between self-stretch text-left"
                                    >
                                        <span className="flex-1 pr-4 font-plus-jakarta text-base leading-7 font-bold text-popjoy-ink">
                                            {faq.question}
                                        </span>
                                        <div
                                            className={cn(
                                                'flex shrink-0 items-center justify-center',
                                                isOpen
                                                    ? 'h-[34px] w-[34px] rounded-full bg-popjoy-purple'
                                                    : '',
                                            )}
                                        >
                                            <img
                                                src={
                                                    isOpen
                                                        ? chevronUpIconSrc
                                                        : chevronIconSrc
                                                }
                                                alt=""
                                                aria-hidden="true"
                                                className={cn(
                                                    'shrink-0',
                                                    isOpen
                                                        ? 'h-[18px] w-[18px]'
                                                        : 'h-[14px] w-[14px]',
                                                )}
                                            />
                                        </div>
                                    </button>

                                    {/* Answer panel */}
                                    {isOpen && (
                                        <div
                                            id={`faq-panel-${fIndex}`}
                                            role="region"
                                            className="self-stretch font-sans text-sm leading-6"
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
            </div>
        </section>
    );
}
